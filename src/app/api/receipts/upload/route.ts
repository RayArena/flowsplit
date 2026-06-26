import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Receipt from "@/models/Receipt";
import { uploadReceiptImage } from "@/lib/cloudinary";
import { parseReceiptText } from "@/features/ocr/receiptParser";

// OCR is now handled client-side (browser Tesseract.js)
// This route: saves receipt image to Cloudinary + stores parsed data

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const body = await req.json();
    const { imageBase64, rawText } = body;

    if (!imageBase64 && !rawText) {
      return NextResponse.json({ error: "Either imageBase64 or rawText is required" }, { status: 400 });
    }

    let imageUrl = "";
    let publicId: string | undefined;

    // Upload to Cloudinary if image is provided
    if (imageBase64) {
      try {
        const uploaded = await uploadReceiptImage(imageBase64);
        imageUrl = uploaded.url;
        publicId = uploaded.publicId;
      } catch (err) {
        console.warn("Cloudinary upload failed, storing without image URL:", err);
      }
    }

    // Parse the raw text that was extracted client-side
    let extractedData;
    if (rawText) {
      extractedData = { ...parseReceiptText(rawText), rawText };
    } else {
      extractedData = {
        rawText: "",
        vendor: undefined,
        date: undefined,
        amount: undefined,
        items: [],
      };
    }

    const receipt = await Receipt.create({
      imageUrl,
      publicId,
      extractedData,
    });

    return NextResponse.json({ data: receipt }, { status: 201 });
  } catch (error) {
    console.error("POST /api/receipts/upload", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
