import React from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const navigate = useNavigate();
  const { cartItems } = useSelector((state)=>state.user);
  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-6">
      <div className="w-full max-w-[800px]">
        <div className="flex items-center gap-5 mb-6">
          <div className="z-10">
            <button onClick={() => navigate("/")}>
              <div className="flex group">
                <IoArrowBackCircleOutline
                  size={35}
                  className="text-[#ec4a09] font-mulish-extrabold group-hover:scale-110 transition-transform"
                />
              </div>
            </button>
          </div>
          <h1 className="text-2xl font-mulish-regular font-bold ">Your Cart</h1>
        </div>
        {cartItems?.length === 0 ? (
            <div className="text-center text-gray-500 mt-20 font-mulish-regular">
                Your Cart is Empty
            </div>
        ): (
            <div></div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
