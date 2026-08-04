import React, { useState } from 'react';
import { StudentProfile, Lesson, DrivingSkill } from '../types';

interface ProfileViewProps {
  profile: StudentProfile;
  lessons: Lesson[];
  tests?: DrivingTest[];
  onUpdateProfile: (updated: StudentProfile) => void;
  onImportFullData?: (importedLessons: Lesson[], importedProfile: StudentProfile) => void;
  onResetData: () => void;
}

const DEFAULT_SKILLS: DrivingSkill[] = [
  { id: '1', name: 'חניה במקביל למדרכה', isChecked: true },
  { id: '2', name: 'זינוק בעלייה ברכב ידני', isChecked: true },
  { id: '3', name: 'פנייה שמאלה בצומת מרומזר', isChecked: true },
  { id: '4', name: 'השתלבות בכביש מהיר', isChecked: false },
  { id: '5', name: 'נסיעה בכיכר דו-נתיבית', isChecked: true },
  { id: '6', name: 'נהיגה בתנאי חשיכה (לילה)', isChecked: false },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  lessons,
  tests = [],
  onUpdateProfile,
  onImportFullData,
  onResetData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [instructorName, setInstructorName] = useState(profile.instructorName);
  const [instructorPhone, setInstructorPhone] = useState(profile.instructorPhone);
  const [carModel, setCarModel] = useState(profile.carModel);
  const [gearType, setGearType] = useState<'ידני' | 'אוטומט'>(profile.gearType || 'ידני');
  const [requiredLessons, setRequiredLessons] = useState(profile.requiredLessons);
  const [pricePerLesson, setPricePerLesson] = useState(profile.pricePerLesson);
  const [showSkillsChecklist, setShowSkillsChecklist] = useState(profile.showSkillsChecklist ?? true);
  const [showResetModal, setShowResetModal] = useState(false);

  const [skills, setSkills] = useState<DrivingSkill[]>(
    profile.skillsList && profile.skillsList.length > 0 ? profile.skillsList : DEFAULT_SKILLS
  );
  const [newSkillName, setNewSkillName] = useState('');

  const completedCount = lessons.filter((l) => l.status === 'completed').length;
  const lessonsPaid = lessons
    .filter((l) => l.paymentStatus === 'paid' && l.status === 'completed')
    .reduce((sum, l) => sum + l.price, 0);

  const testsPaid = tests
    .filter((t) => t.paymentStatus === 'paid')
    .reduce((sum, t) => sum + t.totalPrice, 0);

  const totalPaid = lessonsPaid + testsPaid;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      avatarUrl,
      instructorName,
      instructorPhone,
      carModel,
      gearType,
      requiredLessons: Number(requiredLessons),
      pricePerLesson: Number(pricePerLesson),
      showSkillsChecklist,
      skillsList: skills,
    });
    setIsEditing(false);
  };

  const toggleSkillCheck = (id: string) => {
    const updated = skills.map((s) => (s.id === id ? { ...s, isChecked: !s.isChecked } : s));
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
      id: `skill-${Date.now()}`,
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

  const handleDeleteSkill = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = skills.filter((s) => s.id !== id);
    setSkills(updated);
    onUpdateProfile({
      ...profile,
      skillsList: updated,
    });
  };

  // Format WhatsApp Link (Strictly direct link without pre-filled message text)
  const getWhatsAppLink = () => {
    let cleanPhone = instructorPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '972' + cleanPhone.substring(1);
    }
    return `https://wa.me/${cleanPhone}`;
  };

  // Export JSON
  const handleExportJSON = () => {
    const data = {
      profile: {
        ...profile,
        showSkillsChecklist,
        skillsList: skills,
      },
      lessons,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drivetrack_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.lessons && Array.isArray(parsed.lessons) && parsed.profile) {
          if (onImportFullData) {
            onImportFullData(parsed.lessons, parsed.profile);
            alert('הנתונים קובצו ויובאו בהצלחה!');
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

  return (
    <main className="max-w-2xl mx-auto px-4 pt-4 pb-32 space-y-6">
      {/* Student Profile Card */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-[#c3c5d7] flex flex-col sm:flex-row items-center gap-5">
        <div className="relative group w-20 h-20 rounded-full bg-[#dbe1ff] overflow-hidden border-2 border-[#1a56db] shrink-0 shadow-xs">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center sm:text-right space-y-1 flex-1">
          <h2 className="text-[22px] font-bold text-[#141c2b]">{profile.name}</h2>
          <p className="text-[14px] text-[#434654] flex items-center justify-center sm:justify-start gap-1">
            <span className="material-symbols-outlined text-[18px] text-[#003fb1]">
              directions_car
            </span>
            סוג רכב: {profile.carModel} ({profile.gearType})
          </p>
          <p className="text-[14px] text-[#434654] flex items-center justify-center sm:justify-start gap-1">
            <span className="material-symbols-outlined text-[18px] text-[#003fb1]">
              person
            </span>
            מורה נהיגה: {profile.instructorName}
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-[#e8eeff] hover:bg-[#e0e8fd] text-[#003fb1] px-4 py-2 rounded-xl text-[14px] font-bold transition-colors flex items-center gap-1 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          {isEditing ? 'סגור עריכה' : 'ערוך פרופיל'}
        </button>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-white p-5 rounded-2xl border border-[#1a56db]/40 space-y-4 shadow-sm animate-in fade-in duration-200"
        >
          <h3 className="font-bold text-[16px] text-[#141c2b]">עדכון פרטי תלמיד ומורה נהיגה</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[12px] font-semibold text-[#434654] mb-1">
                קישור לתמונת פרופיל (Avatar URL)
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#434654] mb-1">
                שם התלמיד
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
              <label className="block text-[12px] font-semibold text-[#434654] mb-1">
                שם מורה הנהיגה
              </label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#434654] mb-1">
                טלפון מורה הנהיגה (ל-WhatsApp)
              </label>
              <input
                type="text"
                value={instructorPhone}
                onChange={(e) => setInstructorPhone(e.target.value)}
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#434654] mb-1">
                דגם רכב הלימוד
              </label>
              <input
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#434654] mb-1">
                סוג גיר / רכב
              </label>
              <select
                value={gearType}
                onChange={(e) => setGearType(e.target.value as 'ידני' | 'אוטומט')}
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px] bg-white"
              >
                <option value="ידני">ידני</option>
                <option value="אוטומט">אוטומט</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#434654] mb-1">
                רף שיעורים נדרש לטסט
              </label>
              <input
                type="number"
                value={requiredLessons}
                onChange={(e) => setRequiredLessons(Number(e.target.value))}
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[12px] font-semibold text-[#434654] mb-1">
                מחיר לשיעור ברירת מחדל (₪)
              </label>
              <input
                type="number"
                value={pricePerLesson}
                onChange={(e) => setPricePerLesson(Number(e.target.value))}
                className="w-full p-2.5 border border-[#c3c5d7] rounded-xl text-[14px]"
              />
            </div>

            {/* Toggle Skills Checklist Visibility */}
            <div className="sm:col-span-2 bg-[#f1f3ff] p-3.5 rounded-xl border border-[#c3c5d7]/50 flex items-center justify-between">
              <span className="font-semibold text-[14px] text-[#141c2b]">
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
          </div>

          <button
            type="submit"
            className="w-full bg-[#1a56db] text-white py-2.5 rounded-xl font-bold text-[15px] hover:bg-[#003fb1] transition-colors"
          >
            שמור עדכונים
          </button>
        </form>
      )}

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#c3c5d7]/50 text-center space-y-1">
          <span className="text-[12px] text-[#434654]">שיעורים שבוצעו</span>
          <p className="text-[22px] font-bold text-[#003fb1]">
            {completedCount}/{profile.requiredLessons}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c3c5d7]/50 text-center space-y-1">
          <span className="text-[12px] text-[#434654]">סכום ששולם</span>
          <p className="text-[22px] font-bold text-green-700">₪{totalPaid}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c3c5d7]/50 text-center space-y-1">
          <span className="text-[12px] text-[#434654]">שיעורים נותרים</span>
          <p className="text-[22px] font-bold text-amber-700">
            {Math.max(0, profile.requiredLessons - completedCount)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c3c5d7]/50 text-center space-y-1">
          <span className="text-[12px] text-[#434654]">סוג רכב</span>
          <p className="text-[18px] font-bold text-[#141c2b]">{profile.gearType}</p>
        </div>
      </div>

      {/* WhatsApp Link to Instructor */}
      <div className="bg-emerald-600 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[12px] opacity-90 font-medium">הודעה למורה הנהיגה</span>
          <h3 className="text-[18px] font-bold">{profile.instructorName}</h3>
          <p className="text-[13px] opacity-90">{profile.instructorPhone}</p>
        </div>

        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-emerald-800 px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-emerald-50 active:scale-95 transition-all text-[14px]"
        >
          <span className="material-symbols-outlined text-[20px] text-emerald-600">chat</span>
          שלח הודעת WhatsApp
        </a>
      </div>

      {/* Practical Driving Skills Checklist (Show only if showSkillsChecklist is true) */}
      {showSkillsChecklist && (
        <div className="bg-white p-5 rounded-2xl border border-[#c3c5d7] space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[16px] text-[#141c2b] flex items-center gap-2">
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
              className="bg-[#1a56db] text-white px-4 py-2 rounded-xl text-[13px] font-bold hover:bg-[#003fb1] transition-colors flex items-center gap-1 shrink-0"
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
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  skill.isChecked
                    ? 'bg-green-50 border-green-200 text-green-900'
                    : 'bg-white border-[#c3c5d7]/50 text-[#434654]'
                }`}
              >
                <span className="text-[14px] font-medium flex-1">{skill.name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      skill.isChecked ? 'text-green-600 fill-1' : 'text-[#737686]'
                    }`}
                  >
                    {skill.isChecked ? 'check_circle' : 'circle'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSkill(skill.id, e)}
                    className="text-[#737686] hover:text-[#ba1a1a] p-1 rounded-lg hover:bg-red-50 transition-colors"
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

      {/* Data Export / Import for GitHub & Vercel */}
      <div className="bg-white p-5 rounded-2xl border border-[#c3c5d7] space-y-3">
        <div className="flex items-center gap-2 text-[#003fb1]">
          <span className="material-symbols-outlined">description</span>
          <h3 className="font-bold text-[16px]">שמירה, ייצוא וייבוא נתונים בקובץ JSON</h3>
        </div>
        <p className="text-[13px] text-[#434654] leading-relaxed">
          האפליקציה שומרת נתונים באופן אוטומטי בדפדפן (LocalStorage). כדי לגבות או להעביר את הנתונים לשרת סטטי, ל-GitHub או ל-Vercel, ניתן להוריד או להעלות קובץ JSON שמתעדכן בלחיצת כפתור:
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={handleExportJSON}
            className="bg-[#1a56db] text-white px-4 py-2.5 rounded-xl font-bold text-[13px] hover:bg-[#003fb1] transition-colors flex items-center gap-2 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            ייצוא קובץ JSON
          </button>

          <label className="bg-[#e8eeff] text-[#003fb1] px-4 py-2.5 rounded-xl font-bold text-[13px] hover:bg-[#dbe1ff] transition-colors flex items-center gap-2 cursor-pointer border border-[#c3c5d7]/60">
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
      <div className="bg-white p-5 rounded-2xl border border-[#c3c5d7] space-y-3">
        <h3 className="font-bold text-[15px] text-[#141c2b]">איפוס נתונים</h3>
        <p className="text-[13px] text-[#434654]">
          ניתן לאפס את כל הנתונים לערכי ברירת המחדל הראשוניים במידת הצורך.
        </p>

        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="bg-[#ba1a1a] hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-[14px] font-bold transition-colors flex items-center gap-2 shadow-xs active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">restart_alt</span>
          איפוס נתונים לברירת המחדל
        </button>
      </div>

      {/* Reset Confirmation Popup Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center border border-[#c3c5d7]">
            <div className="w-12 h-12 bg-red-100 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <h3 className="text-[18px] font-bold text-[#141c2b]">איפוס כל הנתונים</h3>
            <p className="text-[14px] text-[#434654] leading-relaxed">
              האם אתה בטוח שברצונך לאפס את כל הנתונים לדוגמה ולחזור לברירת המחדל? פעולה זו אינה ניתנת לבטול.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onResetData();
                  setShowResetModal(false);
                }}
                className="flex-1 bg-[#ba1a1a] text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-xs"
              >
                מאשר איפוס
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 border border-[#c3c5d7] py-3 rounded-xl text-[#434654] font-medium hover:bg-[#f1f3ff]"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
