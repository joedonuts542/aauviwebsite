import Image from "next/image"
import Link from "next/link"

export default function TermsPage() {
    return (
        <div
            className="flex flex-col gap-4 w-screen min-h-screen bg-indigo-50 py-36 px-64"
        >
            <span
                className="text-indigo-950 text-3xl font-bold"
            >Terms of Service</span>
            <span
                className="text-indigo-950 text-sm mb-12"
            >{`Please read these Terms of Service ("Terms") carefully before using our website. These Terms constitute a legal agreement between you ("User" or "you") and neuro ("we," "us," or "our"). By accessing or using our website, you agree to be bound by these Terms.`}</span>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 1: User Eligibility</span>
                <span
                    className="text-indigo-950 text-sm"
                >1.1 Age Restriction: You must be at least 13 years old to use our website. By accessing or using our website, you represent and warrant that you are 13 years of age or older. If you are under 13 years old, you may not use our website or provide any personal information to us. We do not knowingly collect personal information from individuals under the age of 13. Protecting the privacy of children is of utmost importance to us, and we comply with the Children&apos;s Online Privacy Protection Act (COPPA) and other applicable regulations.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 2: Intellectual Property</span>
                <span
                    className="text-indigo-950 text-sm"
                >2.1 Ownership: The intellectual property rights associated with the website and its content, including but not limited to copyrights, trademarks, and patents, are owned by neuro, the user, and Roblox, as applicable. These intellectual property rights are protected by applicable laws and international treaties. You acknowledge and agree that you do not acquire any ownership rights or licenses to the intellectual property by using our website, except as expressly granted in these Terms. You agree not to reproduce, modify, distribute, or otherwise exploit any materials or content from our website without the prior written consent of the respective owners.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 3: User Responsibilities</span>
                <span
                    className="text-indigo-950 text-sm"
                >3.1 Content Generation: Our website does not allow users to generate or upload content. You agree not to generate or attempt to generate any content on our website. This includes, but is not limited to, submitting text, images, videos, or any other form of user-generated content. By refraining from generating content, you understand that you are solely responsible for the content you provide and share through our website, including any personal information or comments you may disclose in connection with your use of our services. You also agree not to engage in any activities that may violate the rights of others or disrupt the operation of our website.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 4: Privacy Policy</span>
                <span
                    className="text-indigo-950 text-sm"
                >4.1 Data Privacy: Our data privacy practices are outlined in our Privacy Policy, which can be found <Link className="text-indigo-500" href="/privacy">here</Link>. The Privacy Policy provides detailed information on how we collect, use, disclose, and protect your personal information. We are committed to protecting your privacy and maintaining the security of your personal information. By using our website, you consent to the collection, use, and disclosure of your information as described in the Privacy Policy. It is important to review the Privacy Policy to understand our data practices fully.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 5: Billing and Financial Transactions</span>
                <span
                    className="text-indigo-950 text-sm"
                >5.1 No Billing: Our website does not involve any billing or financial transactions. You will not be charged for using our website, and we do not store or process any payment information. We may offer certain services or features that require separate agreements or payments, which will be clearly stated and provided to you separately. Any financial transactions conducted outside our website are solely between you and the respective third parties, and we are not responsible for such transactions or any related issues.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 6: Dispute Resolution</span>
                <span
                    className="text-indigo-950 text-sm"
                >6.1 Contact Support: In the event of any dispute arising from or relating to these Terms or your use of our website, please email our support team at support@theneuro.io. We value your satisfaction and will make reasonable efforts to resolve disputes in a timely and fair manner. Please provide detailed information about the issue or dispute, including relevant documents or evidence, to help us address your concerns effectively. If we are unable to resolve the dispute through informal negotiations, either party may initiate legal proceedings in the courts located in the United States of America.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 7: Modification</span>
                <span
                    className="text-indigo-950 text-sm"
                >7.1 Changes to the Terms: We reserve the right to modify or update these Terms at any time, without prior notice. Any changes will be effective immediately upon posting on our website. It is your responsibility to review these Terms periodically to stay informed of any updates. We may also provide notifications or alerts regarding material changes to these Terms. Your continued use of the website after the changes will signify your acceptance of the updated Terms. If you do not agree with the revised Terms, you should discontinue using our website.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 8: Severability</span>
                <span
                    className="text-indigo-950 text-sm"
                >8.1 Enforceability: If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will continue in full force and effect. The invalidity or unenforceability of any provision shall not affect the validity or enforceability of any other provision of these Terms. These Terms constitute the entire agreement between you and us regarding your use of our website, superseding any prior agreements or understandings.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 9: Governing Law</span>
                <span
                    className="text-indigo-950 text-sm"
                >9.1 Jurisdiction: These Terms shall be governed by and construed in accordance with the laws of the United States of America. Any legal action or proceeding arising out of or relating to these Terms shall be exclusively resolved in the courts located in the United States of America. You hereby submit to the personal jurisdiction of such courts for the purpose of litigating any such action or proceeding. Our failure to enforce any right or provision of these Terms shall not be considered a waiver of those rights. The section titles in these Terms are for convenience only and have no legal or contractual effect.</span>
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold ml-8"
                >Section 10: Contact Information</span>
                <span
                    className="text-indigo-950 text-sm"
                >10.1 Support Email: If you have any questions, concerns, or inquiries regarding these Terms, please contact our support team at support@theneuro.io. We are here to assist you and address any issues you may encounter while using our website. We aim to provide prompt and reliable support, and we appreciate your feedback as it helps us improve our services and enhance your experience.</span>
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
                    >Posted on June 03, 2023 at 11:15 AM Eastern Time</span>
                    <span
                        className="text-indigo-950 text-sm"
                    >Authored by Edward, edvwards, approved by neuro</span>
                </div>
            </div>
        </div>
    )
}