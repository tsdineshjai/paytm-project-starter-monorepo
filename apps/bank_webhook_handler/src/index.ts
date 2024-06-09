import prisma from "@repo/db/client";
import express from "express";

const app = express();

app.post("/hdfcWebhook", async (req, res) => {
	//TODO: Add zod validation here?
	const paymentInformation: {
		token: string;
		userId: string;
		amount: string;
	} = {
		token: req.body.token,
		userId: req.body.user_identifier,
		amount: req.body.amount,
	};

	try {
		await prisma.$transaction([
			prisma.balance.updateMany({
				where: {
					userId: Number(paymentInformation.token),
				},
				data: {
					amount: {
						increment: Number(paymentInformation.amount),
					},
				},
			}),

			prisma.onRampTransaction.updateMany({
				where: {
					token: paymentInformation.token,
				},
				data: {
					status: "Success",
				},
			}),
		]);

		res.json({
			message: "Captured",
		});
	} catch (error) {
		res.status(411).json({
			message: "Error while processing webhook",
		});
	}
});
