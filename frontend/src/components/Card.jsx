/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const Card = ({ id, handleCloseCard }) => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg border border-gray-300 p-4 w-64">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Card ID: {id}</h2>
        <button
          className="text-red-500 hover:text-red-700 font-bold text-sm"
          onClick={handleCloseCard}
        >
          ✖
        </button>
      </div>
      <p className="text-gray-600 mt-2">Details of the card with ID {id} go here.</p>
    </div>
  );
};

export default Card;
