import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
	const formData = await req.formData();
	const nome = String(formData.get("nome") || "").trim();
	const email = String(formData.get("email") || "").trim();
	if (!nome || !email) {
		return NextResponse.redirect(new URL("/", req.url));
	}
	const leadsDir = path.join(process.cwd(), "data", "leads");
	const csvPath = path.join(leadsDir, "leads.csv");
	await fs.mkdir(leadsDir, { recursive: true });
	const header = "nome,email,data\n";
	const row = `${nome.replace(/,/g, " ")},${email.replace(/,/g, " ")},${new Date().toISOString()}\n`;
	try {
		await fs.access(csvPath);
	} catch {
		await fs.writeFile(csvPath, header, "utf8");
	}
	await fs.appendFile(csvPath, row, "utf8");
	return NextResponse.redirect(new URL("/obrigado-lead", req.url));
}