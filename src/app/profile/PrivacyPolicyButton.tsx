'use client';

import { useState } from 'react';
import { IconLock, IconChevronRight, IconX } from '@tabler/icons-react';

const POLICY_TEXT = `
**Privacy Policy – Plant Health App**
*Last updated: March 2026*

---

**1. Information We Collect**

We collect information you provide directly to us, including:
- **Account information:** email address, username, and profile photo when you create an account.
- **Plant scan data:** images you upload and the AI analysis results associated with them.
- **Usage data:** pages visited, features used, and session duration.

**2. How We Use Your Information**

We use the information we collect to:
- Provide, maintain, and improve the Plant Health App.
- Process plant scans and deliver AI-generated diagnostics.
- Send transactional emails (e.g., account confirmation).
- Analyze usage patterns to improve user experience.

**3. Data Sharing**

We do not sell, trade, or rent your personal information to third parties. We may share data with:
- **Service providers** who assist us in operating the app (e.g., cloud hosting, AI processing), under strict confidentiality agreements.
- **Legal authorities** when required by applicable law.

**4. Data Retention**

We retain your account data for as long as your account is active. Scan history is retained to power historical diagnostics. You may request deletion of your data at any time by contacting us.

**5. Security**

We implement industry-standard security measures, including encrypted storage and HTTPS-only communication, to protect your data.

**6. Your Rights**

Depending on your location, you may have the right to:
- Access, update, or delete your personal data.
- Object to or restrict certain processing activities.
- Export your data in a portable format.

To exercise any of these rights, contact us at **privacy@planthealthapp.com**.

**7. Children's Privacy**

Plant Health App is not directed to children under 13. We do not knowingly collect personal data from children.

**8. Changes to This Policy**

We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice in the app or sending you an email.

**9. Contact Us**

If you have questions about this Privacy Policy, please contact:
**Plant Health App** · privacy@planthealthapp.com
`;

function renderMarkdown(text: string) {
    return text.trim().split('\n').map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
            const content = line.slice(2, -2);
            return <p key={i} className="font-bold text-slate-900 mt-4 mb-1 text-sm">{content}</p>;
        }
        if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
            return <p key={i} className="text-slate-400 text-xs italic mb-3">{line.slice(1, -1)}</p>;
        }
        if (line.startsWith('---')) {
            return <hr key={i} className="border-slate-100 my-3" />;
        }
        if (line.startsWith('- ')) {
            return <li key={i} className="text-sm text-slate-600 leading-relaxed ml-4 list-disc">{renderInline(line.slice(2))}</li>;
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm text-slate-600 leading-relaxed">{renderInline(line)}</p>;
    });
}

function renderInline(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

export default function PrivacyPolicyButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-slate-50 transition-colors w-full cursor-pointer group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center transition-colors group-hover:bg-[#13ec49]/20 group-hover:text-[#13ec49]">
                        <IconLock size={24} stroke={1.5} />
                    </div>
                    <span className="font-medium text-slate-900">Privacy Policy</span>
                </div>
                <IconChevronRight size={20} stroke={1.5} className="text-slate-400" />
            </button>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[88dvh] animate-slide-up-fade-in">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#13ec49]/20 text-[#13ec49] flex items-center justify-center">
                                    <IconLock size={18} stroke={1.5} />
                                </div>
                                <h2 className="text-base font-bold text-slate-900 m-0">Privacy Policy</h2>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors border-none cursor-pointer"
                            >
                                <IconX size={16} stroke={2} />
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div className="overflow-y-auto px-6 py-4 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            <ul className="list-none p-0 m-0">
                                {renderMarkdown(POLICY_TEXT)}
                            </ul>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 shrink-0">
                            <button
                                onClick={() => setOpen(false)}
                                className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm border-none cursor-pointer hover:bg-slate-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
