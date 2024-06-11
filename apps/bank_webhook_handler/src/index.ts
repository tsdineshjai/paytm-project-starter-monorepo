import prisma from "@repo/db/client";
import express from "express";

const app = express();

app.use(express.json());

app.post("/hdfcWebhook", async (req, res) => {
	const { token, user_identifier, amount } = await req.body;
	// TODO: Add zod validation here?
	const paymentInformation: {
		token: string;
		userId: string;
		amount: string;
	} = {
		token,
		userId: user_identifier,
		amount,
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

app.listen(3007, () => {
	console.log(`web hook is listening to the port 3007`);
});
