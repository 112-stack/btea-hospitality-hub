import { useState } from 'react';
import { FiCheckCircle, FiExternalLink, FiFile, FiMessageSquare, FiPhone, FiShield, FiUploadCloud } from 'react-icons/fi';
import { officialPortalLinks, portalApi } from '../services/portalApi';
import usePortalStore from '../stores/portalStore';

const directorates = [
  'Business Development and Licensing Directorate',
  'CEO Office',
  'Deputy CEO',
  'Marketing and Promotion Directorate',
  'Ministry of Tourism',
  'Policies and Planning Directorate',
  'Projects and Facilities Directorate',
  'Resources and Information Directorate',
  'Tourism Monitoring Directorate',
];

const emptyForm = { name: '', email: '', phone: '', subject: '', date: '', directorate: '', message: '' };

const Complaints = () => {
  const [form, setForm] = useState(emptyForm);
  const [attachments, setAttachments] = useState([]);
  const [verification, setVerification] = useState({ status: 'idle', id: null, code: '', demoCode: null, mode: null });
  const [notice, setNotice] = useState('Complete phone verification before submitting a local complaint working copy.');
  const { complaints, addComplaint } = usePortalStore();

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const requestCode = async () => {
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 8) return setNotice('Enter a valid phone number before requesting verification.');
    try {
      const result = await portalApi.requestComplaintVerification(form.phone);
      setVerification({ status: 'requested', id: result.verificationId, code: '', demoCode: result.demoCode, mode: 'api' });
      setNotice(`Local demonstration code created${result.demoCode ? `: ${result.demoCode}` : ''}. It was not sent by SMS.`);
    } catch {
      setVerification({ status: 'requested', id: `local-${Date.now()}`, code: '', demoCode: '2468', mode: 'fallback' });
      setNotice('API adapter unavailable. Use local demonstration code 2468; no SMS or external request was sent.');
    }
  };

  const confirmCode = async () => {
    if (!verification.id || !verification.code) return setNotice('Enter the verification code.');
    try {
      if (verification.mode === 'api') await portalApi.verifyComplaintPhone(verification.id, verification.code);
      else if (verification.code !== verification.demoCode) throw new Error('Verification code is incorrect');
      setVerification((current) => ({ ...current, status: 'verified' }));
      setNotice('Phone verified for this local working copy.');
    } catch (error) {
      setNotice(error.message || 'Verification failed. Check the code and try again.');
    }
  };

  const handleFiles = (event) => {
    const next = Array.from(event.target.files || []).slice(0, 10).map((file) => ({ name: file.name, size: file.size }));
    setAttachments(next);
    event.target.value = '';
  };

  const submit = async (event) => {
    event.preventDefault();
    if (verification.status !== 'verified') return setNotice('Verify the phone number before submitting.');
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || !form.subject.trim() || !form.directorate || !form.message.trim()) {
      return setNotice('Name, valid email, subject, directorate, and message are required.');
    }
    const payload = { ...form, verificationId: verification.id, attachments: attachments.map((file) => file.name) };
    let reference;
    try {
      if (verification.mode === 'api') {
        const result = await portalApi.submitComplaint(payload);
        reference = result.complaint.id;
      }
    } catch {
      reference = null;
    }
    const localComplaint = addComplaint({
      ...form,
      phone: undefined,
      phoneLast4: form.phone.replace(/\D/g, '').slice(-4),
      attachments: attachments.map((file) => file.name),
      apiReference: reference || null,
    });
    setNotice(`Complaint working copy received locally as ${reference || localComplaint.id}. No protected production endpoint was called.`);
    setForm(emptyForm);
    setAttachments([]);
    setVerification({ status: 'idle', id: null, code: '', demoCode: null, mode: null });
  };

  return (
    <div>
      <header className="page-heading-row"><div><span className="page-eyebrow">Public support</span><h1>Complaints</h1><p>A safer reconstruction of the observed complaint form with POST-based local verification and clear privacy boundaries.</p></div><a className="secondary-action" href={officialPortalLinks.complaints} target="_blank" rel="noreferrer">Official complaint form <FiExternalLink aria-hidden="true" /></a></header>
      <div className="inline-notice" role="status">{notice}</div>
      <div className="complaint-layout">
        <form className="workspace-card complaint-form" onSubmit={submit} noValidate>
          <div className="workspace-card-header"><div><span className="page-eyebrow">Local working copy</span><h2>Contact details</h2></div><FiShield aria-hidden="true" /></div>
          <div className="form-grid">
            <label><span>Name <b aria-hidden="true">*</b></span><input name="name" value={form.name} onChange={update} autoComplete="name" required /></label>
            <label><span>Email <b aria-hidden="true">*</b></span><input type="email" name="email" value={form.email} onChange={update} autoComplete="email" required /></label>
            <div className="form-field wide"><label htmlFor="complaint-phone">Phone <b aria-hidden="true">*</b></label><div className="phone-verification"><input id="complaint-phone" type="tel" name="phone" value={form.phone} onChange={(event) => { update(event); setVerification({ status: 'idle', id: null, code: '', demoCode: null, mode: null }); }} autoComplete="tel" inputMode="tel" required disabled={verification.status === 'verified'} /><button type="button" onClick={requestCode} disabled={verification.status === 'verified'}><FiPhone aria-hidden="true" />{verification.status === 'verified' ? 'Verified' : 'Create local code'}</button></div></div>
            {verification.status === 'requested' && <div className="form-field wide"><label htmlFor="complaint-code">Verification code</label><div className="phone-verification"><input id="complaint-code" inputMode="numeric" value={verification.code} onChange={(event) => setVerification((current) => ({ ...current, code: event.target.value }))} aria-describedby="verification-help" /><button type="button" onClick={confirmCode}>Verify</button></div><small id="verification-help">This is a local demonstration code, not an SMS from BTEA.</small></div>}
          </div>

          <hr />
          <div className="workspace-card-header"><div><span className="page-eyebrow">Routing</span><h2>Complaint information</h2></div><FiMessageSquare aria-hidden="true" /></div>
          <div className="form-grid">
            <label><span>Subject <b aria-hidden="true">*</b></span><input name="subject" value={form.subject} onChange={update} required /></label>
            <label><span>Date (optional)</span><input type="date" name="date" value={form.date} onChange={update} /></label>
            <label className="wide"><span>Directorate <b aria-hidden="true">*</b></span><select name="directorate" value={form.directorate} onChange={update} required><option value="">Select a directorate</option>{directorates.map((directorate) => <option key={directorate}>{directorate}</option>)}</select></label>
            <label className="wide"><span>Complaint message <b aria-hidden="true">*</b></span><textarea name="message" rows="6" value={form.message} onChange={update} required /></label>
            <label className="wide upload-zone"><FiUploadCloud aria-hidden="true" /><span><strong>Add supporting files</strong><small>Up to 10 file names are kept in this local demonstration; bytes are not uploaded.</small></span><input type="file" multiple onChange={handleFiles} /></label>
          </div>
          {attachments.length > 0 && <ul className="attachment-chips">{attachments.map((file) => <li key={`${file.name}-${file.size}`}><FiFile aria-hidden="true" />{file.name}<small>{Math.ceil(file.size / 1024)} KB</small></li>)}</ul>}
          <div className="case-footer"><p>The official service also uses reCAPTCHA. This local reconstruction intentionally does not embed or bypass it.</p><button type="submit" className="btn-btea action-button">Submit local working copy</button></div>
        </form>

        <aside className="workspace-card complaint-history" aria-labelledby="complaint-history-title"><div className="workspace-card-header"><div><span className="page-eyebrow">On this device</span><h2 id="complaint-history-title">Recent references</h2></div><span className="count-badge">{complaints.length}</span></div>{complaints.length ? complaints.map((complaint) => <article key={complaint.id}><FiCheckCircle aria-hidden="true" /><span><strong>{complaint.subject}</strong><small>{complaint.id} · {complaint.directorate}</small></span><span className="status-pill success">{complaint.status}</span></article>) : <div className="case-empty">No local complaint references yet.</div>}<div className="complaint-privacy"><FiShield aria-hidden="true" /><div><strong>Privacy improvements</strong><p>Phone verification uses POST requests, no test personal data is embedded, and only the last four phone digits are retained by the local API.</p></div></div></aside>
      </div>
    </div>
  );
};

export default Complaints;
