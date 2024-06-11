import { getServerSession } from "next-auth";
import { SendCard } from "../../../Components/sendcard";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/client";

function Peer2PeerTransfer() {
	return (
		<main className="flex gap-4 justify-center py-3 items-start mx-auto w-screen ">
			<SendCard />
			<PeerToPeerDisplay />
		</main>
	);
}

async function getPeerToPeerTransactions() {
	const session = await getServerSession(authOptions);

	const p2pTransactions = await prisma.p2pTransfer.findMany({
		where: {
			fromUserId: Number(session?.user.id),
		},
	});

	return p2pTransactions;
}

async function PeerToPeerDisplay() {
	const p2pArray = await getPeerToPeerTransactions();

	return (
		<main className="flex gap-5 justify-center items-center h-screen flex-col overflow-scroll p-4  pr-10 ">
			<p className="border-b   mt-3 font-mono text-2xl text-red-800 ">
				Recent Peer2Peer Transactions
			</p>

			<div>
				{p2pArray.map((item) => {
					const { timestamp } = item;
					const options: Intl.DateTimeFormatOptions = {
						day: "numeric",
						month: "long",
					};
					const formattedDate: string = timestamp.toLocaleDateString(
						"en-US",
						options
					);
					return (
						<section
							key={item.id}
							className="flex flex-col gap-4 border rounded-lg px-3 py-3"
						>
							<p>To ID : {item.toUserId}</p>
							<p> Amount transferred : {item.amount}</p>
							<p> Transaction Date : {formattedDate}</p>
						</section>
					);
				})}
			</div>
		</main>
	);
}

export default Peer2PeerTransfer;
