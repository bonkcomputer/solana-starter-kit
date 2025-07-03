import { NextRequest, NextResponse } from 'next/server';
import Irys from '@irys/sdk';

const getIrys = async () => {
    const network = process.env.NEXT_PUBLIC_IRYS_NETWORK || 'mainnet';
    const providerUrl = "https://api.mainnet-beta.solana.com";
    const token = "solana";

    // You can get a private key from a wallet like Phantom
    // It's recommended to load this from an environment variable
    if (!process.env.SOL_PRIVATE_KEY) {
        throw new Error("SOL_PRIVATE_KEY environment variable is not set");
    }

    const irys = new Irys({
        network,
        token,
        key: process.env.SOL_PRIVATE_KEY,
        config: { providerUrl },
    });
    return irys;
}

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
        const irys = await getIrys();
        const receipt = await irys.upload(buffer, {
            tags: [{ name: 'Content-Type', value: file.type }]
        });
        
        const arweaveUrl = `https://arweave.net/${receipt.id}`;

        return NextResponse.json({ url: arweaveUrl });

    } catch (e) {
        console.error("Error uploading to Arweave: ", e);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
} 