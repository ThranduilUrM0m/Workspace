// A link that opens nothing: unknown, replaced by a newer one, or its project
// is finished. One answer for all three, in the three languages at once
// (nothing is known about the visitor, and nothing is said about why).
export default function PortalNotFound() {
    return (
        <main className="pt-gone">
            <span className="pt-mark">
                boutaleb<span className="pt-dot">.</span>
            </span>
            <section lang="fr">
                <h1>Ce lien n’ouvre plus rien.</h1>
                <p>Il a peut-être été remplacé par un plus récent. Le dernier e-mail reçu contient le lien en vigueur ; sinon, répondez à ce message pour en demander un nouveau.</p>
            </section>
            <section lang="en">
                <h1>This link no longer opens anything.</h1>
                <p>A newer one may have replaced it. The latest email received holds the current link; otherwise, reply to that message to ask for a new one.</p>
            </section>
            <section lang="ar" dir="rtl">
                <h1>هذا الرابط لم يعد يفتح شيئاً.</h1>
                <p>ربما حلّ محله رابط أحدث. آخر رسالة وصلتكم تحمل الرابط الساري، وإلا فردّوا عليها لطلب رابط جديد.</p>
            </section>
        </main>
    );
}
