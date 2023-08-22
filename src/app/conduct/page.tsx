import Image from "next/image";

export default function TermsPage() {
    return (
        <div
            className="flex flex-col gap-4 w-screen min-h-screen bg-indigo-50 py-36 px-64"
        >
            <span
                className="text-indigo-950 text-3xl font-bold"
            >Code of Conduct</span>
            <span
                className="text-indigo-950 text-sm mb-12"
            >{`Welcome to neuro! We are committed to fostering a vibrant and inclusive community where individuals can connect, chat, create content, and freely interact. To ensure a positive and respectful environment for all users, we have established this Code of Conduct. By using our website and participating in our community, you agree to abide by the following guidelines:`}</span>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 1: Respect and Inclusivity</span>
                <span
                    className="text-indigo-950 text-sm"
                >1.1 Treat all users with respect and dignity, regardless of their race, ethnicity, gender, sexual orientation, religion, disability, age, or any other personal attribute.</span>
                <span
                    className="text-indigo-950 text-sm"
                >1.2 Do not engage in discriminatory behavior, including hate speech, racism, sexism, homophobia, transphobia, or any form of prejudice.</span>
                <span
                    className="text-indigo-950 text-sm"
                >1.3 Avoid making derogatory comments or offensive jokes about individuals or groups based on their personal attributes.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 2: Responsible Communication</span>
                <span
                    className="text-indigo-950 text-sm"
                >2.1 Engage in meaningful and constructive conversations. Listen actively and consider different perspectives before responding.</span>
                <span
                    className="text-indigo-950 text-sm"
                >2.2 Do not engage in personal attacks, harassment, or bullying. Refrain from making threats, spreading rumors, or engaging in any form of intimidation.</span>
                <span
                    className="text-indigo-950 text-sm"
                >2.3 Respect the boundaries and consent of others. Do not engage in unsolicited or unwelcome advances, requests for personal information, or persistent messaging after being asked to stop.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 3: Content Creation and Sharing</span>
                <span
                    className="text-indigo-950 text-sm"
                >3.1 Create and share content that is legal, respectful, and relevant to the community.</span>
                <span
                    className="text-indigo-950 text-sm"
                >3.2 Do not post or share explicit, violent, or harmful content, including but not limited to pornography, graphic violence, or self-harm images.</span>
                <span
                    className="text-indigo-950 text-sm"
                >3.3 Ensure that your content does not infringe upon the intellectual property rights of others. Give proper attribution when using or referencing someone else&apos;s work.</span>
                <span
                    className="text-indigo-950 text-sm"
                >3.4 Provide trigger warnings or content warnings when discussing sensitive topics that may potentially disturb or trigger emotional distress in others.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 4: Collaboration and Cooperation</span>
                <span
                    className="text-indigo-950 text-sm"
                >4.1 Foster a spirit of collaboration and support within the community. Help others, answer questions, and share knowledge whenever possible.</span>
                <span
                    className="text-indigo-950 text-sm"
                >4.2 Encourage meaningful discussions and debates while maintaining a respectful tone. Disagreements are normal, but personal attacks and hostility are not tolerated.</span>
                <span
                    className="text-indigo-950 text-sm"
                >4.3 Avoid spamming, excessive self-promotion, or any form of disruptive behavior that may hinder the ability of others to engage in meaningful conversations.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 5: Reporting and Resolution</span>
                <span
                    className="text-indigo-950 text-sm"
                >5.1 Report any violations of this Code of Conduct promptly to the website administrators using the designated reporting mechanisms.</span>
                <span
                    className="text-indigo-950 text-sm"
                >5.2 Provide clear and detailed information about the incident, including relevant screenshots or evidence, to facilitate proper investigation.</span>
                <span
                    className="text-indigo-950 text-sm"
                >5.3 Respect the decisions made by the website administrators and moderators regarding reported violations and disciplinary actions. Do not engage in retaliatory actions against those who report misconduct.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 6: Consequences of Non-Compliance</span>
                <span
                    className="text-indigo-950 text-sm"
                >6.1 Failure to comply with this Code of Conduct will result in administrative action. <b>Users, both on this site and on other neuro-associated platforms, who violate any of the above rules may be permanently banned from accessing neuro.</b> </span>
                <span
                    className="text-indigo-950 text-sm"
                >6.2 Given the severity of the violation, banned users may be allowed back onto neuro after a specified period of time. Any further violations will result in a permanent removal of the account.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 7: Modification</span>
                <span
                    className="text-indigo-950 text-sm"
                >7.1 This Code of Conduct is subject to periodic review and updates. Check for any revisions to stay informed about the latest guidelines and expectations.</span>
            </div>
            <div
                className="flex flex-row gap-4 mt-12"
            >
                <Image
                    width={64}
                    height={64}
                    className="my-auto"
                    src={"/branding/TransparentBoltTextDark.png"}
                    alt={"Logo"}
                />
                <div
                    className="flex flex-col my-auto"
                >
                    <span
                        className="text-indigo-950 text-lg font-semibold"
                    >Posted on June 21, 2023 at 07:00 PM Eastern Time</span>
                    <span
                        className="text-indigo-950 text-sm"
                    >Authored by Edward, edvwards, approved by neuro</span>
                </div>
            </div>
        </div>
    )
}