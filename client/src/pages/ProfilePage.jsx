import React, { useState, useEffect } from 'react';
import {
  User,
  Upload,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building,
  GraduationCap,
  ImagePlus,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const organizationLabel = (value) => !value || value.trim().toLowerCase() === 'global tech university' ? 'Your Organization' : value;

export default function ProfilePage() {
  const { user, student: authStudent, setStudent } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [profileData, setProfileData] = useState({
    // Personal Information
    fullName: authStudent?.fullName || user?.name || 'Alex Morgan',
    avatarUrl: authStudent?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    dateOfBirth: authStudent?.dateOfBirth ? authStudent.dateOfBirth.split('T')[0] : '',
    gender: authStudent?.gender || 'Prefer not to say',
    bloodGroup: authStudent?.bloodGroup || 'Not Specified',
    email: user?.email || '',
    phone: authStudent?.phone || '',
    address: authStudent?.address || '',

    // Organization and card information
    rollNumber: authStudent?.rollNumber || 'ORG-0001',
    collegeName: organizationLabel(authStudent?.collegeName),
    department: authStudent?.department || '',
    course: authStudent?.course || '',
    academicBatch: authStudent?.academicBatch || '',
    graduationYear: authStudent?.graduationYear?.toString() || '',
    logoUrl: authStudent?.logoUrl || '',
  });

  // Pull fresh profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/students/profile');
        if (res.data.success) {
          const s = res.data.data;
          setStudent(s);
          setProfileData((prev) => ({
            ...prev,
            fullName: s.fullName || prev.fullName,
            avatarUrl: s.avatarUrl || prev.avatarUrl,
            dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split('T')[0] : prev.dateOfBirth,
            gender: s.gender || prev.gender,
            bloodGroup: s.bloodGroup || prev.bloodGroup,
            phone: s.phone || prev.phone,
            address: s.address || prev.address,
            rollNumber: s.rollNumber || prev.rollNumber,
            collegeName: organizationLabel(s.collegeName) || prev.collegeName,
            logoUrl: s.logoUrl || prev.logoUrl,
            department: s.department || prev.department,
            course: s.course || prev.course,
            yearOfStudy: s.yearOfStudy || prev.yearOfStudy,
            currentSemester: s.currentSemester?.toString() || prev.currentSemester,
            academicBatch: s.academicBatch || prev.academicBatch,
            graduationYear: s.graduationYear?.toString() || prev.graduationYear,
          }));
        }
      } catch (err) {
        // Fallback to local state if backend not yet running
        console.warn('Backend profile fetch note:', err.message);
      }
    };

    fetchProfile();
  }, [setStudent]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
    setErrorMessage('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit. Please upload a smaller image.');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await api.post('/students/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setProfileData((prev) => ({ ...prev, avatarUrl: res.data.data.avatarUrl }));
        if (authStudent) {
          setStudent({ ...authStudent, avatarUrl: res.data.data.avatarUrl });
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      // Local fallback for offline mode
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Choose an image file for your organization logo.');
      return;
    }
    if (file.size > 512 * 1024) {
      setErrorMessage('Organization logos must be smaller than 512 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileData(current => ({ ...current, logoUrl: reader.result }));
      setSaveSuccess(false);
      setErrorMessage('');
    };
    reader.onerror = () => setErrorMessage('The logo image could not be read. Please choose another file.');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const { graduationYear, ...profileUpdates } = profileData;
      const updates = graduationYear ? { ...profileUpdates, graduationYear } : profileUpdates;
      const res = await api.put('/students/profile', updates);
      if (res.data.success) {
        setStudent(res.data.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile. Using offline cache.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Your profile & organization</h1>
          <p className="text-xs text-slate-500">
            Add your personal details and organization branding for your ID cards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="md" dot>
            Creator account
          </Badge>
          <Badge variant="success" size="md">
            Profile Active
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'personal'
              ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal information</span>
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'academic'
              ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Organization & card</span>
        </button>
      </div>

      {/* Success Alert */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Your profile and organization details have been saved.</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        {activeTab === 'personal' && (
          <div className="space-y-6">
            {/* Avatar Upload Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="relative group">
                <img
                  src={profileData.avatarUrl}
                  alt={profileData.fullName}
                  className="w-24 h-28 object-cover rounded-xl border-2 border-brand-500 shadow-md"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity"
                  title="Upload New Photo"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploadingPhoto}
                  className="hidden"
                />
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-slate-900">Official Profile Photo</h4>
          <p className="text-xs text-slate-500 max-w-md">
                  Upload a clear profile photograph (JPEG, PNG, or WebP, max 2MB). It will appear on your ID card.
                </p>
                <label
                  htmlFor="avatar-upload"
                  className="inline-block mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer"
                >
                  {isUploadingPhoto ? 'Uploading to server...' : 'Choose file from device →'}
                </label>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Name on card"
                name="fullName"
                value={profileData.fullName}
                onChange={handleInputChange}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Account email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleInputChange}
                leftIcon={<Mail className="w-4 h-4" />}
                disabled
                helperText="Email is linked to your account"
              />

              <Input
                label="Phone Number"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                leftIcon={<Phone className="w-4 h-4" />}
                placeholder="+1 (555) 000-0000"
              />

              <Input
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={profileData.dateOfBirth}
                onChange={handleInputChange}
                leftIcon={<Calendar className="w-4 h-4" />}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gender (Optional)
                </label>
                <select
                  name="gender"
                  value={profileData.gender}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Blood Group (Optional)
                </label>
                <select
                  name="bloodGroup"
                  value={profileData.bloodGroup}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="Not Specified">Not Specified</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <Input
                label="Address (Optional)"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  leftIcon={<MapPin className="w-4 h-4" />}
                placeholder="Street, city, region"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {profileData.logoUrl ? <img src={profileData.logoUrl} alt="Organization logo preview" className="h-full w-full object-contain p-2" /> : <ImagePlus className="h-7 w-7 text-slate-300" />}
                </div>
                <div className="min-w-0 flex-1"><h3 className="text-sm font-bold text-slate-900">Organization logo</h3><p className="mt-1 text-xs text-slate-500">Optional · PNG, JPG, SVG, or WebP up to 512 KB. Appears in the logo area on your card designs.</p>
                  <div className="mt-3 flex flex-wrap gap-3"><label htmlFor="organization-logo" className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-brand-400">Choose logo <input id="organization-logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} className="sr-only" /></label>{profileData.logoUrl && <button type="button" onClick={() => setProfileData(current => ({...current,logoUrl:''}))} className="inline-flex items-center gap-1 text-xs font-medium text-rose-600"><X className="h-3.5 w-3.5"/>Remove logo</button>}</div>
                </div>
              </div>
            </section>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="ID number"
                name="rollNumber"
                value={profileData.rollNumber}
                onChange={handleInputChange}
                disabled
                helperText="Your unique card or membership number"
              />

              <Input
                label="Organization name"
                name="collegeName"
                value={profileData.collegeName}
                onChange={handleInputChange}
                leftIcon={<Building className="w-4 h-4" />}
                required
              />

              <Input
                label="Department"
                name="department"
                value={profileData.department}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Role / title / membership type"
                name="course"
                value={profileData.course}
                onChange={handleInputChange}
                leftIcon={<GraduationCap className="w-4 h-4" />}
                required
              />

              <Input
                label="Member / employee since"
                name="academicBatch"
                value={profileData.academicBatch}
                onChange={handleInputChange}
                placeholder="e.g. 2024"
              />

              <Input
                label="ID validity year"
                name="graduationYear"
                value={profileData.graduationYear}
                onChange={handleInputChange}
                placeholder="e.g. 2028"
              />
            </div>
          </div>
        )}

        {/* Save Actions Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Changes will sync to the details used on your ID cards.
          </p>
          <Button
            type="submit"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save profile
          </Button>
        </div>
      </form>
    </div>
  );
}
