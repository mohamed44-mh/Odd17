import React, { useState } from 'react';
import { sendContactMessage } from '../../api/eventApi';
import Spinner from '../../components/common/Spinner';
import { Mail, User, MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setFieldErrors({});

    // Validation client basique
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setErrorMsg('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    if (formData.message.length < 10) {
      setFieldErrors({ message: ['Le message doit comporter au moins 10 caractères.'] });
      return;
    }

    setSubmitting(true);
    try {
      const res = await sendContactMessage(formData);
      setSuccessMsg(res.message || 'Votre message a bien été envoyé !');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else {
        setErrorMsg(err.response?.data?.message || 'Erreur lors de l\'envoi de votre message.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary-50 text-secondary-600 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-secondary-200 mb-3">
            <Mail className="w-4 h-4 text-secondary-500" />
            <span>Support & Partenariats</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-900 tracking-tight">
            Contactez l'équipe EventPartner
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
            Vous avez une question sur le fonctionnement de la plateforme, une proposition d'alliance ou besoin d'assistance ? Écrivez-nous.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Colonne Gauche : Formulaire de contact */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-soft border border-slate-100 p-8 sm:p-10">
            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs font-semibold animate-fade-in">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nom & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Votre nom complet <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ex: Yassine El Amrani"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400"
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.name[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Votre adresse e-mail <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="yassine.elamrani@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.email[0]}</p>
                  )}
                </div>
              </div>

              {/* Sujet */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sujet de votre message <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Ex: Demande de certification association ou question technique"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 font-medium"
                />
                {fieldErrors.subject && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.subject[0]}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    required
                    rows="5"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Expliquez-nous en détail votre demande..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 leading-relaxed font-normal"
                  />
                </div>
                {fieldErrors.message && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.message[0]}</p>
                )}
              </div>

              {/* Bouton Envoyer en Orange Accent */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-bold text-white bg-accent hover:bg-accent-hover rounded-xl shadow-soft transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" color="white" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer mon message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Colonne Droite : Coordonnées & FAQ */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-8 space-y-4">
              <h3 className="text-base font-bold text-primary-900 pb-2 border-b border-slate-100">
                Nos engagements
              </h3>
              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-secondary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-primary-900">Réponse sous 48h</div>
                    <div className="text-slate-500 text-[11px]">Notre équipe traite chaque demande avec attention.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-secondary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-primary-900">Accompagnement & Conseil</div>
                    <div className="text-slate-500 text-[11px]">Aide au cadrage des partenariats multipartites.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-primary-900">Présence au Maroc</div>
                    <div className="text-slate-500 text-[11px]">Couverture nationale pour toutes les associations et initiatives marocaines.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
