import React, { useState } from 'react';
import { StudentProfile, Lesson, DrivingSkill } from '../types';
import { DEFAULT_STUDENT_PROFILE } from '../data/initialData';
import { calculateCompletedLessonUnits } from '../utils/lessonHelpers';
import { ResetConfirmModal } from './ResetConfirmModal';

interface ProfileViewProps {
  profile?: StudentProfile;
  lessons?: Lesson[];
  onUpdateProfile: (newProfile: StudentProfile) => void;
  onResetAllData?: () => void;
  onExportFullData?: () => void;
  onImportFullData?: (importedLessons: Lesson[], importedProfile?: StudentProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile = DEFAULT_STUDENT_PROFILE,
  lessons = [],
  onUpdateProfile,
  onResetAllData,
  onExportFullData,
  onImportFullData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Form State
  const [name, setName] = useState(profile?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [instructorName, setInstructorName] = useState(profile?.instructorName || '');
  const [instructorPhone, setInstructorPhone] = useState(profile?.instructorPhone || '');
  const [instructorMessagingType, setInstructorMessagingType] = useState<'whatsapp' | 'sms'>(
    profile?.instructorMessagingType || 'whatsapp'
  );
  const [carModel, setCarModel] = useState(profile?.carModel || '');
  const [gearType, setGearType] = useState<'ידני' | 'אוטומט'>(profile?.gearType || 'אוטומט');
  const [requiredLessons, setRequiredLessons] = useState<number>(profile?.requiredLessons || 28);

  // Pricing State
  const [pricePerLesson, setPricePerLesson] = useState<number>(profile?.pricePerLesson ?? 0);
  const [defaultRegistrationFee, setDefaultRegistrationFee] = useState<number>(
    profile?.defaultRegistrationFee ?? 0
  );
  const [defaultInternalTestFee, setDefaultInternalTestFee] = useState<number>(
    profile?.defaultInternalTestFee ?? 0
  );
  const [defaultExternalTestFee, setDefaultExternalTestFee] = useState<number>(
    profile?.defaultTestFee ?? 0
  );
  const [defaultCarFee, setDefaultCarFee] = useState<number>(profile?.defaultCarFee ?? 0);

  // Skills Checklist State
  const [showSkillsChecklist, setShowSkillsChecklist] = useState<boolean>(
    profile?.showSkillsChecklist ?? true
  );
  const [skills, setSkills] = useState<DrivingSkill[]>(profile?.skillsList || []);
  const [newSkillName, setNewSkillName] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);

  // Completed metrics
  const completedLessons = lessons.filter((l) => l.status === 'completed');
  const completedCount = calculateCompletedLessonUnits(lessons);
  const totalPaid = lessons
    .filter((l) => l.paymentStatus === 'paid')
    .reduce((sum, l) => sum + (l.price || 0), 0);

  // Avatar Upload from Device Only
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setValidationError('גודל התמונה המרבי הוא 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      setAvatarUrl(dataUrl);
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setValidationError('אנא הזן את שם התלמיד');
      return;
    }

    if (requiredLessons < 28) {
      setValidationError('רף השיעורים הנדרש לטסט אינו יכול להיות פחות מ-28 שיעורים');
      return;
    }

    const updatedProfile: StudentProfile = {
      ...profile,
      isConfigured: true,
      name: name.trim(),
      avatarUrl,
      instructorName: instructorName.trim(),
      instructorPhone: instructorPhone.trim(),
      instructorMessagingType,
      carModel: carModel.trim(),
      gearType,
      requiredLessons: Number(requiredLessons),
      pricePerLesson: Number(pricePerLesson),
      defaultRegistrationFee: Number(defaultRegistrationFee),
      defaultInternalTestFee: Number(defaultInternalTestFee),
      defaultTestFee: Number(defaultExternalTestFee),
      defaultCarFee: Number(defaultCarFee),
      showSkillsChecklist,
      skillsList: skills,
    };

    onUpdateProfile(updatedProfile);
    setIsEditing(false);
    setValidationError(null);
  };

  // Skills Checklist Handlers
  const toggleSkillCheck = (skillId: string) => {
    const updated = skills.map((s) => (s.id === skillId ? { ...s, isChecked: !s.isChecked } : s));
    setSkills(updated);
    onUpdateProfile({
      ...profile,
      skillsList: updated,
    });
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill: DrivingSkill = {
      id: Date.now().toString(),
      name: newSkillName.trim(),
      isChecked: false,
    };

    const updated = [...skills, newSkill];
    setSkills(updated);
    setNewSkillName('');
    onUpdateProfile({
      ...profile,
      skillsList: updated,
    });
  };

  const handleDeleteSkill = (skillId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = skills.filter((s) => s.id !== skillId);
    setSkills(updated);
    onUpdateProfile({
      ...profile,
      skillsList: updated,
    });
  };

  // Export JSON backup
  const handleExportJSON = () => {
    if (onExportFullData) {
      onExportFullData();
    } else {
      const data = {
        profile,
        lessons,
        exportDate: new Date().toISOString(),
        version: '1.0',
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drivetrack_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Import JSON backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.lessons && Array.isArray(parsed.lessons) && parsed.profile) {
          if (onImportFullData) {
            onImportFullData(parsed.lessons, parsed.profile);
            alert('הנתונים יובאו בהצלחה!');
          }
        } else {
          alert('קובץ JSON לא תקין. יש לוודא שזהו קובץ גיבוי מורשה של DriveTrack.');
        }
      } catch (err) {
        alert('שגיאה בקריאת הקובץ');
      }
    };
    reader.readAsText(file);
  };

  const completedSkillsCount = skills.filter((s) => s.isChecked).length;

  const hasInstructorContact = Boolean(
    profile?.instructorName?.trim() && profile?.instructorPhone?.trim()
  );

  const cleanPhone = (profile?.instructorPhone || '').replace(/\D/g, '');

  const getMessagingLink = () => {
    if (profile?.instructorMessagingType === 'sms') {
      return `sms:${profile?.instructorPhone || cleanPhone}`;
    }
    const waPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.substring(1) : cleanPhone;
    return `https://wa.me/${waPhone}`;
  };

  return (
    <main className="max-w-2xl mx-auto px-4 pt-4 pb-32 space-y-6">
      {/* Student Profile Card */}
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-[#c3c5d7] flex flex-col sm:flex-row items-center gap-5">
        <div className="relative group w-20 h-20 rounded-full bg-[#dbe1ff] overflow-hidden border-2 border-[#1a56db] shrink-0 shadow-xs flex items-center justify-center">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile?.name || 'שם תלמיד'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-[42px] text-[#003fb1]">person</span>
          )}
        </div>

        <div className="text-center sm:text-right space-y-1 flex-1">
          <h2 className="text-[20px] font-bold text-[#141c2b]">{profile?.name || 'שם תלמיד'}</h2>

          {profile?.carModel?.trim() ? (
            <p className="text-[14px] text-[#434654] flex items-center justify-center sm:justify-start gap-1">
              <span className="material-symbols-outlined text-[18px] text-[#003fb1]">
                directions_car
              </span>
              סוג רכב: {profile.carModel} ({profile?.gearType || 'אוטומט'})
            </p>
          ) : null}

          {profile?.instructorName?.trim() ? (
            <p className="text-[14px] text-[#434654] flex items-center justify-center sm:justify-start gap-1">
              <span className="material-symbols-outlined text-[18px] text-[#003fb1]">
                person
              </span>
              מורה נהיגה: {profile.instructorName}
            </p>
          ) : null}
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-[#e8eeff] hover:bg-[#e0e8fd] text-[#003fb1] px-4 py-2 rounded-xl text-[14px] font-bold transition-colors flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          {isEditing ? 'סגור עריכה' : 'ערוך פרופיל'}
        </button>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 rounded-3xl border border-[#1a56db]/50 space-y-4 shadow-sm animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#c3c5d7]/50 pb-2">
            <h3 className="font-bold text-[16px] text-[#141c2b] text-right">הגדרות פרופיל, מורה ומחירים</h3>
          </div>

          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-[13px] font-semibold">
              {validationError}
            </div>
          )}

          {/* Photo upload from device ONLY */}
          <div className="bg-[#f8f9ff] p-4 rounded-2xl border border-[#c3c5d7]/60 space-y-3">
            <label className="block text-[13px] font-bold text-[#141c2b] text-right">
              תמונת פרופיל של התלמיד (העלאה מהמכשיר)
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#dbe1ff] overflow-hidden border-2 border-[#1a56db] shrink-0 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[32px] text-[#003fb1]">person</span>
                )}
              </div>

              <div className="flex-1 space-y-2 w-full flex flex-wrap items-center gap-2">
                <label className="bg-[#1a56db] text-white px-3.5 py-2 rounded-xl text-[13px] font-bold hover:bg-[#003fb1] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  העלאת תמונה מהמכשיר
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="text-red-600 text-[12px] font-bold hover:underline px-2 py-1"
                  >
                    הסר תמונה
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                שם התלמיד *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                שם מורה הנהיגה
              </label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                placeholder="לדוגמה: דני כהן"
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                טלפון מורה הנהיגה (לשליחת הודעות)
              </label>
              <input
                type="text"
                value={instructorPhone}
                onChange={(e) => setInstructorPhone(e.target.value)}
                placeholder="לדוגמה: 050-1234567"
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px] text-right"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                אופן שליחת הודעות למורה
              </label>
              <div className="flex rounded-xl bg-[#f0f4ff] p-1 border border-[#c3c5d7]/50 h-10 items-center">
                <button
                  type="button"
                  onClick={() => setInstructorMessagingType('whatsapp')}
                  className={`flex-1 py-1 text-[12px] font-bold rounded-lg transition-all ${
                    instructorMessagingType === 'whatsapp'
                      ? 'bg-[#1a56db] text-white shadow-xs'
                      : 'text-[#434654]'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setInstructorMessagingType('sms')}
                  className={`flex-1 py-1 text-[12px] font-bold rounded-lg transition-all ${
                    instructorMessagingType === 'sms'
                      ? 'bg-[#1a56db] text-white shadow-xs'
                      : 'text-[#434654]'
                  }`}
                >
                  SMS
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                דגם רכב הלימוד
              </label>
              <input
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                placeholder="לדוגמה: סקודה פאביה"
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                סוג גיר / רכב
              </label>
              <select
                value={gearType}
                onChange={(e) => setGearType(e.target.value as 'ידני' | 'אוטומט')}
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px] bg-white font-medium text-right"
              >
                <option value="אוטומט">אוטומט</option>
                <option value="ידני">ידני</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                רף שיעורים נדרש לטסט (מינימום 28) *
              </label>
              <input
                type="number"
                min={28}
                value={requiredLessons}
                onChange={(e) => setRequiredLessons(Math.max(28, Number(e.target.value)))}
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
                required
              />
            </div>
          </div>

          {/* Detailed Pricing Settings Section */}
          <div className="border-t border-[#c3c5d7]/50 pt-3 space-y-3">
            <h4 className="text-[14px] font-bold text-[#003fb1] flex items-center gap-1.5 text-right">
              <span className="material-symbols-outlined text-[18px]">payments</span>
              הגדרות מחירים ואגרות
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Lesson Price */}
              <div>
                <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                  מחיר שיעור נהיגה (₪) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={pricePerLesson}
                  onChange={(e) => setPricePerLesson(Number(e.target.value))}
                  className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
                  required
                />
              </div>

              {/* 2. Registration Fee */}
              <div>
                <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                  מחיר דמי רישום לביה"ס (₪) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={defaultRegistrationFee}
                  onChange={(e) => setDefaultRegistrationFee(Number(e.target.value))}
                  className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
                  required
                />
              </div>

              {/* 3. Internal Test Fee */}
              <div>
                <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                  מחיר מבחן פנימי (₪) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={defaultInternalTestFee}
                  onChange={(e) => setDefaultInternalTestFee(Number(e.target.value))}
                  className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
                  required
                />
              </div>

              {/* 4. External Test Fee */}
              <div>
                <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                  מחיר אגרת טסט (₪) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={defaultExternalTestFee}
                  onChange={(e) => setDefaultExternalTestFee(Number(e.target.value))}
                  className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
                  required
                />
              </div>

              {/* 5. Car Rental Fee for Test */}
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold text-[#434654] mb-1 text-right">
                  מחיר העמדת רכב לטסט (₪) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={defaultCarFee}
                  onChange={(e) => setDefaultCarFee(Number(e.target.value))}
                  className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Toggle Skills Checklist Visibility */}
          <div className="bg-[#f1f3ff] p-3.5 rounded-2xl border border-[#c3c5d7]/50 flex items-center justify-between">
            <span className="font-semibold text-[14px] text-[#141c2b] text-right">
              הצג תפריט מיומנויות נדרשות לטסט
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showSkillsChecklist}
                onChange={(e) => setShowSkillsChecklist(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#c3c5d7] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a56db]"></div>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1a56db] text-white py-3 rounded-2xl font-bold text-[15px] hover:bg-[#003fb1] transition-colors shadow-xs cursor-pointer"
          >
            שמור עדכונים
          </button>
        </form>
      )}

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#c3c5d7]/50 text-center space-y-1 shadow-xs">
          <span className="text-[12px] text-[#434654] font-medium">שיעורים שבוצעו</span>
          <p className="text-[22px] font-black text-[#003fb1]">
            {completedCount}/{profile.requiredLessons || 28}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#c3c5d7]/50 text-center space-y-1 shadow-xs">
          <span className="text-[12px] text-[#434654] font-medium">סכום ששולם</span>
          <p className="text-[22px] font-black text-green-700">₪{totalPaid.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#c3c5d7]/50 text-center space-y-1 shadow-xs">
          <span className="text-[12px] text-[#434654] font-medium">שיעורים נותרים</span>
          <p className="text-[22px] font-black text-amber-700">
            {Math.max(0, (profile.requiredLessons || 28) - completedCount)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#c3c5d7]/50 text-center space-y-1 shadow-xs">
          <span className="text-[12px] text-[#434654] font-medium">סוג רכב</span>
          <p className="text-[18px] font-bold text-[#141c2b]">{profile.gearType || 'אוטומט'}</p>
        </div>
      </div>

      {/* WhatsApp / SMS Link to Instructor (Only if instructor info is filled) */}
      {hasInstructorContact && (
        <div className="bg-emerald-600 text-white p-5 rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 text-right">
            <span className="text-[12px] opacity-90 font-medium">שליחת הודעה למורה הנהיגה</span>
            <h3 className="text-[18px] font-bold">{profile.instructorName}</h3>
            <p className="text-[13px] opacity-90">{profile.instructorPhone}</p>
          </div>

          <a
            href={getMessagingLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-emerald-800 px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-50 active:scale-95 transition-all text-[14px]"
          >
            <span className="material-symbols-outlined text-[20px] text-emerald-600">
              {profile.instructorMessagingType === 'sms' ? 'sms' : 'chat'}
            </span>
            {profile.instructorMessagingType === 'sms' ? 'שלח הודעת SMS' : 'שלח הודעת WhatsApp'}
          </a>
        </div>
      )}

      {/* Practical Driving Skills Checklist */}
      {showSkillsChecklist && (
        <div className="bg-white p-5 rounded-3xl border border-[#c3c5d7] space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[16px] text-[#141c2b] flex items-center gap-2 text-right">
              <span className="material-symbols-outlined text-[#003fb1]">checklist</span>
              מיומנויות נדרשות למבחן מעשי (טסט)
            </h3>
            <span className="text-[12px] text-[#003fb1] font-bold">
              {completedSkillsCount}/{skills.length} הושלמו
            </span>
          </div>

          {/* Add New Skill Form */}
          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="הוסף מיומנות נהיגה חדשה..."
              className="flex-1 px-3 py-2 border border-[#c3c5d7] rounded-xl text-[14px] text-[#141c2b] focus:ring-2 focus:ring-[#1a56db]"
            />
            <button
              type="submit"
              className="bg-[#1a56db] text-white px-4 py-2 rounded-xl text-[13px] font-bold hover:bg-[#003fb1] transition-colors flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              הוסף
            </button>
          </form>

          {/* Skills List */}
          <div className="space-y-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                onClick={() => toggleSkillCheck(skill.id)}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  skill.isChecked
                    ? 'bg-green-50 border-green-200 text-green-900'
                    : 'bg-white border-[#c3c5d7]/50 text-[#434654]'
                }`}
              >
                <span className="text-[14px] font-medium flex-1 text-right">{skill.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <span
                      className={`material-symbols-outlined text-[22px] ${
                        skill.isChecked ? 'text-green-600' : 'text-[#737686]'
                      }`}
                    >
                      {skill.isChecked ? 'check_circle' : 'circle'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSkill(skill.id, e)}
                    className="w-8 h-8 flex items-center justify-center text-[#737686] hover:text-[#ba1a1a] rounded-lg hover:bg-red-50 transition-colors"
                    title="מחק מיומנות זו"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Export / Import */}
      <div className="bg-white p-5 rounded-3xl border border-[#c3c5d7] space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-[#003fb1]">
          <span className="material-symbols-outlined">description</span>
          <h3 className="font-bold text-[16px] text-right">שמירה, ייצוא וייבוא נתונים בקובץ JSON</h3>
        </div>
        <p className="text-[13px] text-[#434654] leading-relaxed text-right">
          האפליקציה שומרת נתונים באופן אוטומטי בדפדפן (LocalStorage). כדי לגבות או להעביר את הנתונים למכשיר אחר, ניתן להוריד או להעלות קובץ JSON:
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={handleExportJSON}
            className="bg-[#1a56db] text-white px-4 py-2.5 rounded-xl font-bold text-[13px] hover:bg-[#003fb1] transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            ייצוא קובץ JSON
          </button>

          <label className="bg-[#e8eeff] text-[#003fb1] px-4 py-2.5 rounded-xl font-bold text-[13px] hover:bg-[#dbe1ff] transition-colors flex items-center gap-2 cursor-pointer border border-[#c3c5d7]/60 shadow-xs">
            <span className="material-symbols-outlined text-[18px]">upload</span>
            ייבוא מקובץ JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* App Data Reset */}
      {onResetAllData && (
        <div className="bg-white p-5 rounded-3xl border border-red-200 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-[#ba1a1a]">
            <span className="material-symbols-outlined">restart_alt</span>
            <h3 className="font-bold text-[16px] text-right">איפוס ורישום מחדש</h3>
          </div>
          <p className="text-[13px] text-[#434654] leading-relaxed text-right">
            פעולה זו תמחק את כל השיעורים, הטסטים וההגדרות שנשמרו, ותחזיר את האפליקציה למסך ההגדרה הראשוני.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="bg-[#ba1a1a] hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              איפוס מלא והתחלה מחדש
            </button>
          </div>
        </div>
      )}

      {/* Final Reset Confirmation Modal */}
      {onResetAllData && (
        <ResetConfirmModal
          isOpen={isResetConfirmOpen}
          onClose={() => setIsResetConfirmOpen(false)}
          onConfirm={onResetAllData}
        />
      )}
    </main>
  );
};
