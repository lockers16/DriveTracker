import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { DEFAULT_STUDENT_PROFILE } from '../data/initialData';

interface OnboardingViewProps {
  initialProfile?: StudentProfile;
  onSaveProfile: (profile: StudentProfile) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  initialProfile = DEFAULT_STUDENT_PROFILE,
  onSaveProfile,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatarUrl || '');
  const [instructorName, setInstructorName] = useState(initialProfile?.instructorName || '');
  const [instructorPhone, setInstructorPhone] = useState(initialProfile?.instructorPhone || '');
  const [instructorMessagingType, setInstructorMessagingType] = useState<'whatsapp' | 'sms'>(
    initialProfile?.instructorMessagingType || 'whatsapp'
  );
  const [carModel, setCarModel] = useState(initialProfile?.carModel || '');
  const [gearType, setGearType] = useState<'ידני' | 'אוטומט'>('אוטומט');

  // Prices: start empty unless already configured
  const [pricePerLesson, setPricePerLesson] = useState<string>(
    initialProfile?.isConfigured && initialProfile.pricePerLesson ? String(initialProfile.pricePerLesson) : ''
  );
  const [defaultRegistrationFee, setDefaultRegistrationFee] = useState<string>(
    initialProfile?.isConfigured && initialProfile.defaultRegistrationFee ? String(initialProfile.defaultRegistrationFee) : ''
  );
  const [defaultInternalTestFee, setDefaultInternalTestFee] = useState<string>(
    initialProfile?.isConfigured && initialProfile.defaultInternalTestFee ? String(initialProfile.defaultInternalTestFee) : ''
  );
  const [defaultTestFee, setDefaultTestFee] = useState<string>(
    initialProfile?.isConfigured && initialProfile.defaultTestFee ? String(initialProfile.defaultTestFee) : ''
  );
  const [defaultCarFee, setDefaultCarFee] = useState<string>(
    initialProfile?.isConfigured && initialProfile.defaultCarFee ? String(initialProfile.defaultCarFee) : ''
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Image Upload from device only
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage('גודל התמונה המרבי הוא 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      setAvatarUrl(dataUrl);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('אנא הזן את שמך');
      return;
    }

    const pLesson = pricePerLesson.trim() ? Number(pricePerLesson) : 0;
    const pReg = defaultRegistrationFee.trim() ? Number(defaultRegistrationFee) : 0;
    const pIntTest = defaultInternalTestFee.trim() ? Number(defaultInternalTestFee) : 0;
    const pExtTest = defaultTestFee.trim() ? Number(defaultTestFee) : 0;
    const pCar = defaultCarFee.trim() ? Number(defaultCarFee) : 0;

    const configuredProfile: StudentProfile = {
      ...initialProfile,
      isConfigured: true,
      name: name.trim(),
      avatarUrl,
      instructorName: instructorName.trim(),
      instructorPhone: instructorPhone.trim(),
      instructorMessagingType,
      carModel: carModel.trim(),
      gearType,
      requiredLessons: 28,
      pricePerLesson: pLesson,
      defaultRegistrationFee: pReg,
      defaultInternalTestFee: pIntTest,
      defaultTestFee: pExtTest,
      defaultCarFee: pCar,
      registrationFeePayment: {
        isPaid: false,
        amount: pReg,
      },
    };

    onSaveProfile(configuredProfile);
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141c2b] flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#c3c5d7]/60 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#e8eeff] text-[#003fb1] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <span className="material-symbols-outlined text-[36px]">directions_car</span>
          </div>
          <h1 className="text-[24px] sm:text-[26px] font-black text-[#003fb1] tracking-tight">
            ברוכים הבאים ל-DriveTrack
          </h1>
          <p className="text-[14px] text-[#434654] max-w-md mx-auto">
            הגדרת פרטי הלימוד והמחירון האישי בפעם הראשונה כדי לנהל את השיעורים, הטסטים והתשלומים בקלות.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-[14px] p-3.5 rounded-xl font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload from Device Only */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#f0f4ff]/60 border border-[#c3c5d7]/40">
            <div className="relative group w-20 h-20 rounded-full bg-[#dbe1ff] overflow-hidden border-2 border-[#1a56db] flex items-center justify-center shrink-0 shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt="תמונת פרופיל" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[40px] text-[#003fb1]">person</span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-right space-y-1.5">
              <label className="block text-[14px] font-bold text-[#141c2b]">תמונת פרופיל (העלאה מהמכשיר)</label>
              <p className="text-[12px] text-[#434654]">ניתן להעלות תמונה מהגלריה או לצלם ישירות מהטלפון</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <label className="cursor-pointer bg-[#1a56db] hover:bg-[#003fb1] text-white text-[13px] font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  העלאת תמונה
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="text-[12px] text-red-600 hover:underline font-bold px-2 py-1"
                  >
                    הסר תמונה
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="space-y-4">
            <h2 className="text-[16px] font-bold text-[#141c2b] border-b border-[#c3c5d7]/40 pb-2 text-right">
              פרטי תלמיד ומורה
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                  שם מלא <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="לדוגמה: ישראל ישראלי"
                  required
                  className="w-full h-11 px-3.5 bg-white border border-[#c3c5d7] rounded-xl text-[14px] font-medium text-[#141c2b] focus:ring-2 focus:ring-[#1a56db] outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                  שם מורה הנהיגה
                </label>
                <input
                  type="text"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  placeholder="לדוגמה: דני כהן"
                  className="w-full h-11 px-3.5 bg-white border border-[#c3c5d7] rounded-xl text-[14px] font-medium text-[#141c2b] focus:ring-2 focus:ring-[#1a56db] outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                  טלפון מורה הנהיגה (לשליחת הודעות)
                </label>
                <input
                  type="tel"
                  value={instructorPhone}
                  onChange={(e) => setInstructorPhone(e.target.value)}
                  placeholder="לדוגמה: 050-1234567"
                  className="w-full h-11 px-3.5 bg-white border border-[#c3c5d7] rounded-xl text-[14px] font-medium text-[#141c2b] focus:ring-2 focus:ring-[#1a56db] outline-none text-right"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                  אופן שליחת הודעות למורה
                </label>
                <div className="flex rounded-xl bg-[#f0f4ff] p-1 border border-[#c3c5d7]/50 h-11 items-center">
                  <button
                    type="button"
                    onClick={() => setInstructorMessagingType('whatsapp')}
                    className={`flex-1 py-1.5 text-[13px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                      instructorMessagingType === 'whatsapp'
                        ? 'bg-[#1a56db] text-white shadow-xs'
                        : 'text-[#434654] hover:text-[#141c2b]'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstructorMessagingType('sms')}
                    className={`flex-1 py-1.5 text-[13px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                      instructorMessagingType === 'sms'
                        ? 'bg-[#1a56db] text-white shadow-xs'
                        : 'text-[#434654] hover:text-[#141c2b]'
                    }`}
                  >
                    SMS
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                  דגם הרכב
                </label>
                <input
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="לדוגמה: סקודה פאביה / יונדאי i20"
                  className="w-full h-11 px-3.5 bg-white border border-[#c3c5d7] rounded-xl text-[14px] font-medium text-[#141c2b] focus:ring-2 focus:ring-[#1a56db] outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                  סוג רכב (גיר)
                </label>
                <div className="flex rounded-xl bg-[#f0f4ff] p-1 border border-[#c3c5d7]/50 h-11 items-center">
                  <button
                    type="button"
                    onClick={() => setGearType('אוטומט')}
                    className={`flex-1 py-1.5 text-[13px] font-bold rounded-lg transition-all ${
                      gearType === 'אוטומט'
                        ? 'bg-[#1a56db] text-white shadow-xs'
                        : 'text-[#434654] hover:text-[#141c2b]'
                    }`}
                  >
                    אוטומט
                  </button>
                  <button
                    type="button"
                    onClick={() => setGearType('ידני')}
                    className={`flex-1 py-1.5 text-[13px] font-bold rounded-lg transition-all ${
                      gearType === 'ידני'
                        ? 'bg-[#1a56db] text-white shadow-xs'
                        : 'text-[#434654] hover:text-[#141c2b]'
                    }`}
                  >
                    ידני
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Config */}
          <div className="space-y-4 pt-2">
            <div>
              <h2 className="text-[16px] font-bold text-[#141c2b] text-right">מחירון</h2>
              <p className="text-[12px] text-[#434654] text-right">מחירי ברירת המחדל ימולאו אוטומטית בהוספת שיעורים וטסטים</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Price per lesson */}
              <div className="sm:col-span-2 bg-[#f0f4ff]/80 p-3.5 rounded-xl border border-[#1a56db]/30">
                <label className="block text-[13px] font-bold text-[#003fb1] mb-1 text-right">
                  מחיר שיעור נהיגה (₪)
                </label>
                <input
                  type="number"
                  min={1}
                  value={pricePerLesson}
                  onChange={(e) => setPricePerLesson(e.target.value)}
                  placeholder="לדוגמה: 150"
                  className="w-full h-11 px-3.5 bg-white border border-[#c3c5d7] rounded-xl text-[16px] font-black text-[#003fb1] focus:ring-2 focus:ring-[#1a56db] outline-none"
                />
              </div>

              {/* 2. Registration fee */}
              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                  מחיר דמי רישום לביה"ס (₪)
                </label>
                <input
                  type="number"
                  min={1}
                  value={defaultRegistrationFee}
                  onChange={(e) => setDefaultRegistrationFee(e.target.value)}
                  placeholder="לדוגמה: 200"
                  className="w-full h-11 px-3.5 bg-white border border-[#c3c5d7] rounded-xl text-[14px] font-bold text-[#141c2b] focus:ring-2 focus:ring-[#1a56db] outline-none"
                />
              </div>

              {/* 3. Internal test fee */}
              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                  מחיר מבחן פנימי (₪)
                </label>
                <input
                  type="number"
                  min={1}
                  value={defaultInternalTestFee}
                  onChange={(e) => setDefaultInternalTestFee(e.target.value)}
                  placeholder="לדוגמה: 250"
                  className="w-full h-11 px-3.5 bg-white border border-[#c3c5d7] rounded-xl text-[14px] font-bold text-[#141c2b] focus:ring-2 focus:ring-[#1a56db] outline-none"
                />
              </div>

              {/* 4. External test fee */}
              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                  מחיר אגרת טסט (₪)
                </label>
                <input
                  type="number"
                  min={1}
                  value={defaultTestFee}
                  onChange={(e) => setDefaultTestFee(e.target.value)}
                  placeholder="לדוגמה: 165"
                  className="w-full h-11 px-3.5 bg-white border border-[#c3c5d7] rounded-xl text-[14px] font-bold text-[#141c2b] focus:ring-2 focus:ring-[#1a56db] outline-none"
                />
              </div>

              {/* 5. Car rental fee for test */}
              <div>
                <label className="block text-[13px] font-semibold text-[#434654] mb-1 text-right">
                  מחיר העמדת רכב לטסט (₪)
                </label>
                <input
                  type="number"
                  min={1}
                  value={defaultCarFee}
                  onChange={(e) => setDefaultCarFee(e.target.value)}
                  placeholder="לדוגמה: 231"
                  className="w-full h-11 px-3.5 bg-white border border-[#c3c5d7] rounded-xl text-[14px] font-bold text-[#141c2b] focus:ring-2 focus:ring-[#1a56db] outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-13 bg-[#1a56db] hover:bg-[#003fb1] text-white font-bold text-[16px] rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            שמירה ומעבר לאפליקציה
          </button>
        </form>
      </div>
    </div>
  );
};
