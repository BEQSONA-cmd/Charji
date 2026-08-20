import { NextResponse } from "next/server";

export async function GET() {
    try {
        return NextResponse.json("Hello from the API route!");
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
