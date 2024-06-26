import React, { useEffect, useState } from "react";
import axios from "axios";
import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/Layout";
import InputCom from "../Helpers/InputCom";
import { useParams, useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [couponData, setCouponData] = useState([]);
  const [couponCode, setCouponCode] = useState("");

  const token = localStorage.getItem("token");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedAddress(parseInt(id)); // Parse id from params
  }, [id]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/cart-products/", {
          headers: {
            Authorization: `${token}`,
          },
        });
        const data = response.data;
        setCartItems(data.data);
        setSubtotal(data.Subtotal ?? 0);
        setShipping(data.Shipping ?? 0);
        setDiscount(data.Discount ?? 0);
        setTotal(data.TotalPrice ?? 0);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    const fetchUserAddresses = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/get-address/", {
          headers: {
            Authorization: `${token}`,
          },
        });
        setAddresses(response.data.address);
      } catch (error) {
        console.error("Error fetching user addresses:", error);
      }
    };

    const fetchCouponData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/coupons/");
        setCouponData(response.data);
        console.log("Coupon data:", response.data);
      } catch (error) {
        console.error("Error fetching coupon data:", error);
      }
    };

    fetchCartItems();
    fetchUserAddresses();
    fetchCouponData();
  }, [token]);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === "COD") {
      setShipping(prevShipping => prevShipping + 40);
    } else {
      setShipping(prevShipping => prevShipping - 40);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select an address to place the order.");
      return;
    }

    try {
      const response = await axios.post(`http://127.0.0.1:8000/order/create/${selectedAddress}/`, {
        payment_method: paymentMethod,
        coupon_code: couponCode, // Include coupon code in the request
      }, {
        headers: {
          Authorization: `${token}`,
        },
      });
      console.log("Order created:", response.data);
      navigate("/order-success");
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const applyCoupon = () => {
    const appliedCoupon = couponData.find((coupon) => coupon.code === couponCode);

    if (appliedCoupon) {
      if (appliedCoupon.active) {
        setDiscount(appliedCoupon.value);
      } else {
        alert("Coupon code is inactive.");
      }
    } else {
      alert("Invalid coupon code.");
    }
  };


  const handleChange = (e) => {
    setCouponCode(e.target.value); // Update couponCode state with input value
  };

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="checkout-page-wrapper w-full bg-white pb-[60px]">
        <div className="w-full mb-5">
          <PageTitle
            title="Checkout"
            breadcrumb={[
              { name: "home", path: "/" },
              { name: "checkout", path: "/checkout" },
            ]}
          />
        </div>
        <div className="checkout-main-content w-full">
          <div className="container-x mx-auto">
            <div className="w-full sm:mb-10 mb-5">
              {/* Address Selection */}
              <div className="sm:flex sm:space-x-5">
                <div className="sm:w-1/2 w-full mb-5 h-[70px]">
                  <a href="#">
                    <div className="w-full h-full bg-[#F6F6F6] text-qblack flex justify-center items-center">
                      <span className="text-[15px] font-medium">
                        Log into your Account
                      </span>
                    </div>
                  </a>
                </div>
                <div className="flex-1 h-[70px]">
                  <a href="#">
                    <div className="w-full h-full bg-[#F6F6F6] text-qblack flex justify-center items-center">
                      <span className="text-[15px] font-medium">
                        Enter Coupon Code
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div className="w-full lg:flex lg:space-x-5">
              <div className="lg:w-1/2 w-full mb-5 lg:mb-0">
                <div className="flex items-center space-x-4">
                  <InputCom
                    type="text"
                    placeholder="Discount Code"
                    className="flex-grow"
                    value={couponCode}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="w-[90px] h-[40px] black-btn rounded-md"
                    onClick={applyCoupon} // Use applyCoupon directly without ||
                  >
                    <span className="text-sm font-semibold">Apply</span>
                  </button>


                </div>
              </div>

              <div className="lg:w-1/2 w-full">
                <h1 className="sm:text-2xl text-xl text-qblack font-medium mb-5">
                  Order Summary
                </h1>
                <div className="w-full px-10 py-6 border border-[#EDEDED]">
                  <div className="product-list w-full mb-6">
                    <ul className="flex flex-col space-y-4">
                      {cartItems.map((item, index) => (
                        <li key={index}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="rounded-full overflow-hidden w-12 h-12">
                                <img
                                  src={`http://127.0.0.1:8000/${item.image}`}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="text-[15px] text-qblack mb-1.5">
                                  {item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name}
                                  <sup className="text-[13px] text-qgray ml-1 mt-1">
                                    x{item.quantity}
                                  </sup>
                                </h4>
                                <p className="text-[13px] text-qgray">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <div>
                              <span className="text-[15px] text-qblack font-medium">
                                ${item.salePrice * item.quantity}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-qblack uppercase">
                        Subtotal
                      </p>
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-qblack">
                        ${total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <div>
                      <p className="text-[13px] font-medium text-qblack uppercase">
                        Shipping
                      </p>
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-qblack">
                        {shipping === 0 ? (
                          <span style={{ color: 'green' }}>Free Delivery</span>
                        ) : (
                          `$${shipping.toFixed(2)}`
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <div>
                      <p className="text-[15px] font-medium text-qblack uppercase">
                        Total
                      </p>
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-qred">${(subtotal + shipping).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-lg font-medium text-qblack mb-3">
                      Payment Method
                    </p>
                    <div className="flex space-x-3 items-center">
                      <input
                        type="radio"
                        id="cashOnDelivery"
                        name="paymentMethod"
                        className="text-accent-pink-500"
                        onChange={() => handlePaymentMethodChange("COD")}
                      />
                      <label htmlFor="cashOnDelivery" className="text-qblack">
                        Cash on Delivery
                      </label>
                    </div>
                    <div className="flex space-x-3 items-center mt-2">
                      <input
                        type="radio"
                        id="creditCard"
                        name="paymentMethod"
                        className="text-accent-pink-500"
                        onChange={() => handlePaymentMethodChange("razorpay")}
                      />
                      <label htmlFor="creditCard" className="text-qblack">
                        Net Banking
                      </label>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="w-full h-12 bg-black text-white flex justify-center items-center" onClick={handlePlaceOrder}>
                      <span className="text-sm font-semibold">
                        Place Order Now
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
