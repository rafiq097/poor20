/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "../components/Spinner.jsx";

const Card = ({ id, batch, handleCloseCard }) => {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/${batch}/?ID=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res);
        setCardData(res.data.data[0]);
      } catch (err) {
        console.log("Error fetching card data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();

    const handleOutsideClick = (event) => {
      if (event.target.id === "card-backdrop") {
        handleCloseCard();
      }
    };

    window.addEventListener("mousedown", handleOutsideClick);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [id, batch, handleCloseCard]);

  return (
    <div
      id="card-backdrop"
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50"
    >
      <div className="bg-white shadow-lg rounded-lg border border-gray-300 p-6 w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto overflow-y-auto max-h-[80vh]">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 flex justify-center">
            {id}
          </h2>
          <button
            className="text-red-500 hover:text-red-700 font-bold text-sm"
            onClick={handleCloseCard}
          >
            ✖
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner />
          </div>
        ) : cardData ? (
          <div className="mt-4 overflow-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <tbody>
                {Object.entries(cardData || {}).map(([key, value]) => {
                  if (
                    key === "#" ||
                    key === "_id" ||
                    key === "__v" ||
                    key === "createdAt" ||
                    key === "updatedAt" ||
                    key === "Image" ||
                    key === "CET_NO" ||
                    key === "P1" ||
                    key === "P2" ||
                    key === "SSC_BOARD" ||
                    key === "PHONE2" ||
                    !value
                  )
                    return null;
                  return (
                    <tr key={key} className="border-b">
                      <td className="px-4 py-2 text-sm font-medium text-gray-600 uppercase bg-gray-100">
                        {key.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {value ?? "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-red-500 mt-4">No data available for this card.</p>
        )}
      </div>
    </div>
  );
};

export default Card;
