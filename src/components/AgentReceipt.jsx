import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import "./AgentReceipt.css";
import fastpayWatermark from "/static/images/fp/fastpay2.png";
import axiosInstance from "../axiosConfig.js";

const AgentReceipt = () => {
  const { fastPayOrderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [receiptData, setReceiptData] = useState(null);
  const downloadButtonRef = useRef(null);

  useEffect(() => {
    const fetchReceiptData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/moneyTranasfer/agent/getTransactionByReference`,
          {
            params: { fastPayOrderId },
          }
        );

        if (response.data?.success && response.data?.data) {
          const data = response.data.data;

          setReceiptData({
            dateTime: data.date,
            amountUSD: `${data.amountUSD}`,
            feeUSD: `${data.feeUSD}`,
            totalAmountUSD: `${data.totalAmount}`,
            exchangeRate: data.exchangeRate,
            receivedAmount: `${data.receivedAmount}`,
            senderName: data.senderInfo?.senderName || "N/A",
            senderPhone: data.senderInfo?.phoneNumber || "N/A",
            senderType: data.senderInfo?.senderType || "N/A",
            receiverName: data.receiverInfo?.receiverName || "N/A",
            accountNumber: data.receiverInfo?.accountNumber || "N/A",
            transactionStatus: data.receiverInfo?.transactionStatus || "N/A",
            orderId: data.transactionDetails?.orderID || fastPayOrderId,
            paymentDate: data.transactionDetails?.paymentDate || data.date,
            settledAmount: `${
              data.transactionDetails?.settledAmount || "0"
            } ETB`,
            charges: data.transactionDetails?.charges || "0%",
            receiptNumber: data.transactionDetails?.receiptNumber || "N/A",
            totalAmountPaid: `${
              data.transactionDetails?.totalAmountPaid || "0"
            } ETB`,
            totalAmountInWord:
              data.additionalPaymentDetails?.totalAmountInWord || "N/A",
            paymentMode: data.additionalPaymentDetails?.paymentMode || "N/A",
            paymentReason:
              data.additionalPaymentDetails?.paymentReason || "N/A",
            paymentChannel:
              data.additionalPaymentDetails?.paymentChannel || "N/A",
            destinationBank:
              data.additionalPaymentDetails?.destinationBank || "N/A",
          });
        } else {
          setReceiptData(null);
        }
      } catch (error) {
        console.error("Error fetching receipt:", error);
        setReceiptData(null);
      } finally {
        setLoading(false);
      }
    };

    if (fastPayOrderId) {
      fetchReceiptData();
    }
  }, [fastPayOrderId]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("receipt-container");
    const scaleWrapper = document.getElementById("receipt-scale-wrapper");
    const outerWrapper = document.getElementById("receipt-scale-outer");

    if (!element) {
      return;
    }

    let previousDisplay;

    try {
      if (scaleWrapper) {
        scaleWrapper.classList.add("force-scale-1");
      }
      if (outerWrapper) {
        outerWrapper.classList.add("allow-overflow");
      }
      if (downloadButtonRef.current) {
        previousDisplay = downloadButtonRef.current.style.display;
        downloadButtonRef.current.style.display = "none";
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const orientation = canvasWidth > canvasHeight ? "l" : "p";

      const pdf = new jsPDF({
        orientation,
        unit: "pt",
        format: [canvasWidth, canvasHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvasWidth, canvasHeight);
      pdf.save(`FastPay_Receipt_${receiptData.orderId || fastPayOrderId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      if (scaleWrapper) {
        scaleWrapper.classList.remove("force-scale-1");
      }
      if (outerWrapper) {
        outerWrapper.classList.remove("allow-overflow");
      }
      if (downloadButtonRef.current) {
        downloadButtonRef.current.style.display =
          previousDisplay !== undefined ? previousDisplay : "";
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#253B80] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!receiptData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Receipt not found</p>
          <button
            onClick={() => navigate("/agent-transactions")}
            className="mt-4 px-6 py-2 bg-[#253B80] text-white rounded-lg hover:bg-[#1c2d63]"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  const sectionHeaderClass =
    "bg-[#253B80] text-white text-sm font-bold h-11 flex items-center px-4";

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        id="receipt-scale-outer"
        className="w-full px-4 sm:py-5 flex justify-center overflow-x-hidden"
      >
        <div id="receipt-scale-wrapper" className="receipt-scale-wrapper">
          {/* Receipt Container */}
          <div
            id="receipt-container"
            className="relative bg-white shadow-lg rounded-lg overflow-hidden"
          >
            {/* Watermark - Positioned */}
            <div className="pointer-events-none select-none absolute inset-0 z-[100]">
              <img
                src={fastpayWatermark}
                alt="FastPay Watermark"
                className="absolute"
                style={{
                  width: "600px",
                  height: "200px",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%) rotate(-45deg)",
                  opacity: 0.065,
                  mixBlendMode: "multiply",
                  filter: "brightness(0.95)",
                }}
              />
            </div>

            <div className="relative z-[10]">
              {/* Header Section */}
              <div className="bg-[#253B80] px-6 py-3 text-white">
                <div className="flex justify-between items-start">
                  {/* Left Side - Logo */}
                  <div>
                    <div className="mb-2">
                      <img
                        src="/static/images/fp/logo1.png"
                        alt="FastPay Logo"
                        className="h-12 object-contain"
                      />
                    </div>
                    <div className="text-xs opacity-90">
                      <p>FastPay LLC</p>
                      <p>Money Transfer Service</p>
                    </div>
                  </div>
                  {/* Center - License Info */}
                  <div className="text-left text-xs opacity-90 max-w-[280px] leading-relaxed">
                    <p>
                      FastPay LLC is licensed as a Money Transmitter by the
                      Maryland Office of Financial Regulation. License status
                      may be verified through NMLS Consumer Access.
                    </p>
                  </div>
                  {/* Right Side - Company Registration Details */}
                  <div className="text-left text-xs">
                    <p className="mb-1">NMLS ID: 2327896</p>
                    <p className="mb-1">FinCEN ID: 31000249115048</p>
                    <p className="mb-1">NBE Approved</p>
                  </div>
                </div>
              </div>

              {/* Transaction Information Header */}
              <div className="bg-white/80 px-6 py-1.5">
                <p className="text-center font-semibold text-gray-700">
                  Transaction Information
                </p>
              </div>

              {/* Blue Separator Line Below Header */}
              <div className="h-0.5 bg-[#253B80]"></div>

              {/* Transaction Details */}
              <div className="bg-gray-50/80 px-6 py-1.5">
                {/* Date, Receipt No, Amount - Right Aligned */}
                <div className="mb-3 text-sm space-y-1">
                  {/* DATE Row */}
                  <div className="grid grid-cols-3">
                    <div className="col-start-3 flex justify-between whitespace-nowrap">
                      <span className="font-semibold text-gray-600">Date:</span>
                      <span className="text-gray-900 ml-2">
                        {receiptData.dateTime}
                      </span>
                    </div>
                  </div>

                  {/* RECEIPT NO Row */}
                  <div className="grid grid-cols-3">
                    <div className="col-start-3 flex justify-between">
                      <span className="font-semibold text-gray-600">
                        Amount USD:
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {receiptData.amountUSD}
                      </span>
                    </div>
                  </div>

                  {/* AMOUNT Rows */}
                  <div className="grid grid-cols-3">
                    <div className="col-start-3 flex justify-between">
                      <span className="font-semibold text-gray-600">
                        Fee USD:
                      </span>
                      <span className="text-gray-900 font-semibold text-sm">
                        {receiptData.feeUSD}
                      </span>
                    </div>
                    <div className="col-start-3 flex justify-between">
                      <span className="font-semibold text-gray-600">
                        Total Amount USD:
                      </span>
                      <span className="text-gray-900 font-semibold text-sm">
                        {receiptData.totalAmountUSD}
                      </span>
                    </div>
                    <div className="col-start-3 flex justify-between">
                      <span className="font-semibold text-gray-600">
                        Exchange Rate:
                      </span>
                      <span className="text-gray-900 font-semibold text-sm">
                        1 USD = {receiptData.exchangeRate} ETB
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3">
                    <div className="col-start-3 flex justify-between">
                      <span className="font-semibold text-gray-600">
                        Received Amount ETB:
                      </span>
                      <span className="text-gray-900 font-semibold text-sm">
                        {receiptData.receivedAmount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sender and Receiver Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Sender Info */}
                  <div className="bg-white/80 p-0 rounded border border-gray-200 overflow-hidden">
                    <div className={sectionHeaderClass}>
                      <span>Sender Info</span>
                    </div>
                    <div className="p-3 space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs mb-1">
                          Sender Name
                        </p>
                        <p className="font-semibold text-gray-900">
                          {receiptData.senderName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">
                          Phone Number
                        </p>
                        <p className="font-semibold text-gray-900">
                          {receiptData.senderPhone}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">
                          Sender Type
                        </p>
                        <p className="font-semibold text-gray-900">
                          {receiptData.senderType}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Receiver Info */}
                  <div className="bg-white/80 p-0 rounded border border-gray-200 overflow-hidden">
                    <div className={sectionHeaderClass}>
                      <span>Receiver Info</span>
                    </div>
                    <div className="p-3 space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs mb-1">
                          Receiver Name
                        </p>
                        <p className="font-semibold text-gray-900">
                          {receiptData.receiverName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">
                          Account Number
                        </p>
                        <p className="font-semibold text-gray-900">
                          {receiptData.accountNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">
                          Transaction Status
                        </p>
                        <p className="font-semibold text-[#253B80]">
                          {receiptData.transactionStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="mb-4 border border-gray-300 overflow-hidden rounded">
                  {/* Section Header */}
                  <div className={`${sectionHeaderClass} justify-center`}>
                    <span>Transaction details</span>
                  </div>

                  {/* Table Content */}
                  <div className="bg-white/80">
                    {/* First Row - Headers */}
                    <div className="grid grid-cols-3 border-b border-gray-300">
                      <div className="p-2.5 border-r border-gray-300">
                        <p className="text-xs font-semibold text-gray-900">
                          Order ID
                        </p>
                      </div>
                      <div className="p-2.5 border-r border-gray-300">
                        <p className="text-xs font-semibold text-gray-900">
                          Payment date
                        </p>
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-gray-900">
                          Settled Amount
                        </p>
                      </div>
                    </div>

                    {/* Second Row - Values */}
                    <div className="grid grid-cols-3 border-b border-gray-300">
                      <div className="p-2.5 border-r border-gray-300">
                        <p className="text-sm font-semibold text-gray-900">
                          {receiptData.orderId}
                        </p>
                      </div>
                      <div className="p-2.5 border-r border-gray-300">
                        <p className="text-sm font-normal text-gray-900">
                          {receiptData.paymentDate}
                        </p>
                      </div>
                      <div className="p-2.5">
                        <p className="text-sm font-bold text-gray-900">
                          {receiptData.settledAmount}
                        </p>
                      </div>
                    </div>

                    {/* Additional Charges */}
                    <div className="grid grid-cols-3 border-b border-gray-300">
                      <div className="p-2.5 col-start-3">
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 text-xs">
                              Charges
                            </span>
                            <span className="font-semibold text-gray-900 text-sm">
                              {receiptData.charges}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 text-xs">
                              Receipt No.
                            </span>
                            <span className="font-semibold text-gray-900 text-sm">
                              {receiptData.receiptNumber}
                            </span>
                          </div>

                          {/* <div className="flex justify-between items-center">
                            <span className="text-gray-700 text-xs">
                              15% VAT
                            </span>
                            <span className="font-semibold text-gray-900 text-sm">
                              ETB 0
                            </span>
                          </div> */}
                        </div>
                      </div>
                    </div>

                    {/* Total Amount Paid */}
                    <div className="grid grid-cols-3 ">
                      <div className="p-2.5 col-start-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-gray-900">
                            Total Amount Paid
                          </span>
                          <span className="font-bold text-gray-900 text-sm">
                            {receiptData.totalAmountPaid}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details with Stamp */}
                <div className="relative mb-4">
                  {/* Payment Details - Additional */}
                  <div className="text-sm">
                    <div className="flex items-center py-1.5 border-b border-gray-300">
                      <span className="text-gray-600 text-xs w-44">
                        Total Amount in word
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {receiptData.totalAmountInWord}
                      </span>
                    </div>
                    <div className="flex items-center py-1.5 border-b border-gray-300">
                      <span className="text-gray-600 text-xs w-44">
                      Destination Country
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">
                        Ethiopia
                      </span>
                    </div>
                    <div className="flex items-center py-1.5 border-b border-gray-300">
                      <span className="text-gray-600 text-xs w-44">
                        Payment Reason
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {receiptData.paymentReason}
                      </span>
                    </div>
                    <div className="flex items-center py-1.5 border-b border-gray-300">
                      <span className="text-gray-600 text-xs w-44">
                        Payment Channel
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {receiptData.paymentChannel}
                      </span>
                    </div>
                    <div className="flex items-center py-1.5 border-b border-gray-300">
                      <span className="text-gray-600 text-xs w-44">
                        Destination Bank
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {receiptData.destinationBank}
                      </span>
                    </div>
                  </div>

                  {/* Stamp */}
                  {/* <img
                    src={fastpayStamp}
                    alt="FastPay Stamp"
                    className="absolute right-40 top-0 w-48 h-48 object-contain"
                    style={{
                      opacity: 0.7,
                      mixBlendMode: "multiply",
                      filter: "contrast(1.05)",
                      transform: "rotate(15deg)",
                    }}
                  /> */}
                </div>

                {/* Footer Notes */}
                <div className="pt-3 pb-3 text-xs text-gray-600">
                  <p className="text-center leading-relaxed px-4">
                    If you have a complaint, first contact the licensee at{" "}
                    <span className="font-semibold">+1 301-200-7090</span> /{" "}
                    <span className="font-semibold">+251 99-549-9844</span> /{" "}
                    <span className="font-semibold">support@fastpayet.com</span>.
                    {" "}If you still have an unresolved complaint, you may contact
                    the Maryland Office of Financial Regulation at 1100 N. Eutaw
                    Street, Suite 611, Baltimore, Maryland 21201, or visit{" "}
                    <a
                      href="https://www.labor.maryland.gov/finance"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#253B80] underline"
                    >
                      www.labor.maryland.gov/finance
                    </a>
                    .
                  </p>
                </div>

                {/* Download PDF Button */}
                <div
                  className="py-4 text-center print:hidden"
                  ref={downloadButtonRef}
                >
                  <button
                    onClick={handleDownloadPDF}
                    className="px-8 py-3 bg-[#253B80] text-white rounded-lg font-bold hover:bg-[#1c2d63] transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentReceipt;
