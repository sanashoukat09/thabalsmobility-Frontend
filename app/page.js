"use client";

import React, { useState } from "react";

export default function FilterDriverPage() {
  const [file, setFile] = useState(null);
  const [driverName, setDriverName] = useState("");
  const [addBreak, setAddBreak] = useState(false);
  const [breakDate, setBreakDate] = useState("");
  const [breakStartTime, setBreakStartTime] = useState("");
  const [breakEndTime, setBreakEndTime] = useState("");
  const [giveOff, setGiveOff] = useState(false);
  const [offDate, setOffDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTimeInput = (value, max) => {
    if (value === "") return "";
    const num = parseInt(value.replace(/\D/g, ""), 10);
    if (isNaN(num)) return "";
    return Math.max(0, Math.min(max, num)).toString().padStart(2, "0");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!file || !driverName.trim()) {
      setError("Please upload an Excel file and enter a valid driver name (non-empty).");
      return;
    }

    if (addBreak && (!breakDate.trim() || !breakStartTime.trim() || !breakEndTime.trim())) {
      setError("Please provide break date, start time, and end time.");
      return;
    }

    if (addBreak) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      if (!dateRegex.test(breakDate.trim())) {
        setError("Please enter a valid break date (YYYY-MM-DD).");
        return;
      }
      if (!timeRegex.test(breakStartTime.trim()) || !timeRegex.test(breakEndTime.trim())) {
        setError("Please enter valid break times (HH:MM:SS, 24-hour, e.g., 13:00:00, hours 0-23, minutes 0-59, seconds 0-59).");
        return;
      }
    }

    if (giveOff && !offDate.trim()) {
      setError("Please provide an off date.");
      return;
    }

    if (giveOff) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(offDate.trim())) {
        setError("Please enter a valid off date (YYYY-MM-DD).");
        return;
      }
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("file", file);
    const driverNameClean = driverName.trim();
    formData.append("driver_name", driverNameClean);
    formData.append("add_break", addBreak);
    formData.append("give_off", giveOff);

    if (addBreak) {
      const formattedBreakStart = `${breakDate.trim()} ${breakStartTime.trim()}.000`;
      const formattedBreakEnd = `${breakDate.trim()} ${breakEndTime.trim()}.000`;
      formData.append("break_start", formattedBreakStart);
      formData.append("break_end", formattedBreakEnd);
    }

    if (giveOff) {
      formData.append("off_date", offDate.trim());
    }

    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/filter-driver`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `filtered_${driverNameClean.toLowerCase().replace(/\s+/g, '_')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // Reset form
      setFile(null);
      setDriverName("");
      setAddBreak(false);
      setBreakDate("");
      setBreakStartTime("");
      setBreakEndTime("");
      setGiveOff(false);
      setOffDate("");
      document.querySelector('input[type="file"]').value = null;
    } catch (error) {
      console.error("Frontend Error:", error);
      setError(`Error while processing the file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Driver Data Filter
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Filter and download driver schedules
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Upload Excel File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-100
                  hover:file:bg-blue-100 dark:hover:file:bg-blue-800
                  transition-colors duration-200"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Driver Name
            </label>
            <input
              type="text"
              id="driverName"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="Enter Driver Name"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="addBreak"
              checked={addBreak}
              onChange={(e) => setAddBreak(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="addBreak" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Add Break Period
            </label>
          </div>

          {addBreak && (
            <div className="space-y-4 pl-6 border-l-2 border-blue-200 dark:border-blue-800">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Break Date
                </label>
                <input
                  type="date"
                  value={breakDate}
                  onChange={(e) => setBreakDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  placeholder="YYYY-MM-DD"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Break Start Time (24-hour, HH:MM:SS)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="HH"
                      min="0"
                      max="23"
                      step="1"
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={breakStartTime.split(":")[0] || ""}
                      onInput={(e) => {
                        const value = handleTimeInput(e.target.value, 23);
                        const [h, m = "00", s = "00"] = breakStartTime.split(":");
                        setBreakStartTime(`${value}:${m}:${s}`);
                      }}
                      required
                    />
                    <input
                      type="number"
                      placeholder="MM"
                      min="0"
                      max="59"
                      step="1"
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={breakStartTime.split(":")[1] || ""}
                      onInput={(e) => {
                        const value = handleTimeInput(e.target.value, 59);
                        const [h = "00", m, s = "00"] = breakStartTime.split(":");
                        setBreakStartTime(`${h}:${value}:${s}`);
                      }}
                      required
                    />
                    <input
                      type="number"
                      placeholder="SS"
                      min="0"
                      max="59"
                      step="1"
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={breakStartTime.split(":")[2] || ""}
                      onInput={(e) => {
                        const value = handleTimeInput(e.target.value, 59);
                        const [h = "00", m = "00", s] = breakStartTime.split(":");
                        setBreakStartTime(`${h}:${m}:${value}`);
                      }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Break End Time (24-hour, HH:MM:SS)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="HH"
                      min="0"
                      max="23"
                      step="1"
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={breakEndTime.split(":")[0] || ""}
                      onInput={(e) => {
                        const value = handleTimeInput(e.target.value, 23);
                        const [h, m = "00", s = "00"] = breakEndTime.split(":");
                        setBreakEndTime(`${value}:${m}:${s}`);
                      }}
                      required
                    />
                    <input
                      type="number"
                      placeholder="MM"
                      min="0"
                      max="59"
                      step="1"
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={breakEndTime.split(":")[1] || ""}
                      onInput={(e) => {
                        const value = handleTimeInput(e.target.value, 59);
                        const [h = "00", m, s = "00"] = breakEndTime.split(":");
                        setBreakEndTime(`${h}:${value}:${s}`);
                      }}
                      required
                    />
                    <input
                      type="number"
                      placeholder="SS"
                      min="0"
                      max="59"
                      step="1"
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={breakEndTime.split(":")[2] || ""}
                      onInput={(e) => {
                        const value = handleTimeInput(e.target.value, 59);
                        const [h = "00", m = "00", s] = breakEndTime.split(":");
                        setBreakEndTime(`${h}:${m}:${value}`);
                      }}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="giveOff"
              checked={giveOff}
              onChange={(e) => setGiveOff(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="giveOff" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Give Off Day
            </label>
          </div>

          {giveOff && (
            <div className="pl-6 border-l-2 border-blue-200 dark:border-blue-800">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Off Date
                </label>
                <input
                  type="date"
                  value={offDate}
                  onChange={(e) => setOffDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  placeholder="YYYY-MM-DD"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Filtering...
              </>
            ) : (
              "Filter Data"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}