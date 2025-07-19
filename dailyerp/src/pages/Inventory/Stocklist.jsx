import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";



function StockListERP() {
  const [stock, setStock] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filtered = stock

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/stock");
        setStock(response.data);
        console.log("Stock data fetched:", response.data);
      } catch (error) {
        console.error("Failed to fetch stock:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="content">
      <h3 className="mb-3">Stock Inventory</h3>

      {/* Filters */}
      <div className="row mb-4 ">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search by Description or Material No"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Raw Material">Raw Material</option>
            <option value="Consumable">Consumable</option>
            <option value="Hardware">Hardware</option>
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover table-sm align-middle">
          <thead className="table-primary text-center">
            <tr>
              <th>#</th>
              <th>Material No</th>
              <th>Description</th>
              <th>Category</th>
              <th>UOM</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Location</th>
              <th>Lot Number</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {stock.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center">No stock found.</td>
              </tr>
            ) : (
              stock.map((item, i) => (
                <tr key={i}>
                  <td className="text-center">{i + 1}</td>
                  <td>{item.materialId || item.matno}</td>
                  <td>{item.description || item.matdesc}</td>
                  <td>{item.category}</td>
                  <td className="text-center">{item.baseUnit || item.uom}</td>
                  <td className="text-end">{item.quantityAvailable ?? item.quantity}</td>
                  <td className="text-center">
                    <span
                      className={`badge ${(item.status ||
                        (item.quantityAvailable ?? item.quantity) > 10
                        ? "In Stock"
                        : (item.quantityAvailable ?? item.quantity) > 0
                          ? "Low Stock"
                          : "Out of Stock") === "In Stock"
                        ? "bg-success"
                        : (item.status ||
                          (item.quantityAvailable ?? item.quantity) > 0
                          ? "Low Stock"
                          : "Out of Stock") === "Low Stock"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                        }`}
                    >
                      {item.status ||
                        ((item.quantityAvailable ?? item.quantity) > 10
                          ? "In Stock"
                          : (item.quantityAvailable ?? item.quantity) > 0
                            ? "Low Stock"
                            : "Out of Stock")}
                    </span>
                  </td>
                  <td>{item.location || "-"}</td>
                  <td>{item.lotNumber || "-"}</td>
                  <td>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockListERP;
