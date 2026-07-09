import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import {
  Shield, FileText, User, DollarSign, Upload, AlertTriangle,
  ChevronRight, ChevronLeft, CheckCircle, Lock,
  Globe, Facebook, MessageCircle, Wallet, CreditCard, Building, Hash, Mail, EyeOff
} from "lucide-react";
import { trpc } from "@/providers/trpc";

type ReportFormData = {
  title: string;
  description: string;
  category: string;
  incidentDate: string;
  province: string;
  district: string;
  municipality: string;
  location?: string;
  amountLost?: number;
  currency: string;
  language: string;
  victimType: string;
  privacyLevel: string;
  isDefamationAcknowledged: boolean;
};

const categories = [
  { value: "online_scam", label: "Online Scam", icon: AlertTriangle },
  { value: "phishing", label: "Phishing", icon: Mail },
  { value: "social_media_fraud", label: "Social Media Fraud", icon: Facebook },
  { value: "fake_job", label: "Fake Job", icon: Building },
  { value: "identity_theft", label: "Identity Theft", icon: User },
  { value: "investment_scam", label: "Investment Scam", icon: DollarSign },
  { value: "bank_fraud", label: "Bank Fraud", icon: CreditCard },
  { value: "digital_wallet_fraud", label: "Digital Wallet Fraud", icon: Wallet },
  { value: "romance_scam", label: "Romance Scam", icon: Heart },
  { value: "cyberbullying", label: "Cyberbullying", icon: MessageCircle },
  { value: "online_blackmail", label: "Online Blackmail", icon: Lock },
  { value: "fake_website", label: "Fake Website", icon: Globe },
  { value: "fake_app", label: "Fake App", icon: FileText },
  { value: "unauthorized_access", label: "Unauthorized Access", icon: EyeOff },
  { value: "hacking", label: "Hacking", icon: Shield },
  { value: "other", label: "Other", icon: Hash },
];

function Heart(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

const provinces = ["Koshi Pradesh", "Madhesh Pradesh", "Bagmati Pradesh", "Gandaki Pradesh", "Lumbini Pradesh", "Karnali Pradesh", "Sudurpashchim Pradesh"];
const districts: Record<string, string[]> = {
  "Koshi Pradesh": ["Jhapa", "Ilam", "Panchthar", "Taplejung", "Morang", "Sunsari", "Dhankuta", "Terhathum", "Sankhuwasabha", "Bhojpur", "Solukhumbu", "Okhaldhunga", "Khotang", "Udayapur"],
  "Madhesh Pradesh": ["Saptari", "Siraha", "Dhanusha", "Mahottari", "Sarlahi", "Rautahat", "Bara", "Parsa"],
  "Bagmati Pradesh": ["Kathmandu", "Lalitpur", "Bhaktapur", "Kavrepalanchok", "Dhading", "Nuwakot", "Sindhupalchok", "Makwanpur", "Chitwan", "Ramechhap", "Dolakha", "Sindhuli", "Rasuwa"],
  "Gandaki Pradesh": ["Kaski", "Lamjung", "Tanahu", "Gorkha", "Syangja", "Nawalparasi East", "Manang", "Mustang", "Myagdi", "Parbat", "Baglung"],
  "Lumbini Pradesh": ["Rupandehi", "Kapilvastu", "Palpa", "Arghakhanchi", "Gulmi", "Nawalparasi West", "Dang", "Banke", "Bardiya", "Rolpa", "Pyuthan"],
  "Karnali Pradesh": ["Surkhet", "Dailekh", "Jajarkot", "Dolpa", "Jumla", "Kalikot", "Mugu", "Humla", "Salyan", "Rukum West"],
  "Sudurpashchim Pradesh": ["Kailali", "Kanchanpur", "Dadeldhura", "Baitadi", "Darchula", "Bajhang", "Bajura", "Achham", "Doti"],
};
const municipalities: Record<string, string[]> = {
  "Kathmandu": ["Kathmandu Metropolitan City", "Kirtipur Municipality", "Kageshwari Manohara", "Budhanilkantha", "Tokha", "Tarakeshwar", "Gokarneshwar", "Chandragiri", "Nagarjun", "Dakshinkali"],
  "Lalitpur": ["Lalitpur Metropolitan City", "Godawari Municipality", "Mahalaxmi Municipality", "Konjyosom Rural Municipality"],
  "Bhaktapur": ["Bhaktapur Municipality", "Madhyapur Thimi Municipality", "Suryabinayak Municipality", "Changunarayan Municipality"],
  "Kavrepalanchok": ["Dhulikhel Municipality", "Banepa Municipality", "Panauti Municipality", "Panchkhal Municipality"],
  "Jhapa": ["Birtamod Municipality", "Mechinagar Municipality", "Damak Municipality", "Bhadrapur Municipality", "Kankai Municipality"],
  "Morang": ["Biratnagar Metropolitan City", "Sundar Haraicha Municipality", "Urlabari Municipality", "Pathari-Shanischare Municipality"],
  "Sunsari": ["Itahari Sub-Metropolitan City", "Dharan Sub-Metropolitan City", "Inaruwa Municipality"],
  "Kaski": ["Pokhara Metropolitan City", "Annapurna Rural Municipality", "Machhapuchhre Rural Municipality"],
  "Rupandehi": ["Butwal Sub-Metropolitan City", "Siddharthanagar Municipality", "Tilottama Municipality", "Devdaha Municipality"],
  "Chitwan": ["Bharatpur Metropolitan City", "Ratnanagar Municipality", "Rapti Municipality", "Khairahani Municipality"],
  "Dhanusha": ["Janakpur Sub-Metropolitan City", "Dhanushadham Municipality", "Chhireshwornath Municipality"],
  "Kailali": ["Dhangadhi Sub-Metropolitan City", "Tikapur Municipality", "Ghodaghodi Municipality", "Lamki-Chuha Municipality"],
  "Surkhet": ["Birendranagar Municipality", "Gurbhakot Municipality", "Lekbeshi Municipality"],
  "Banke": ["Nepalgunj Sub-Metropolitan City", "Kohalpur Municipality"],
  "Dang": ["Ghorahi Sub-Metropolitan City", "Tulsipur Sub-Metropolitan City", "Lamahi Municipality"],
  "Tanahu": ["Damauli Municipality", "Bhimad Municipality", "Shuklagandaki Municipality"],
  "Gorkha": ["Gorkha Municipality", "Palungtar Municipality"],
  "Makwanpur": ["Hetauda Sub-Metropolitan City", "Thaha Municipality"],
  "Kanchanpur": ["Mahendranagar Municipality", "Bhimdatt Municipality", "Punarbas Municipality"],
  "Bara": ["Kalaiya Sub-Metropolitan City", "Jeetpur-Simara Sub-Metropolitan City"],
  "Parsa": ["Birgunj Metropolitan City", "Pokhariya Municipality"],
  "Ilam": ["Ilam Municipality", "Deumai Municipality", "Mai Municipality"],
  "Saptari": ["Rajbiraj Municipality", "Kanchanrup Municipality", "Bodebarsain Municipality"],
  "Siraha": ["Siraha Municipality", "Lahan Municipality", "Golbazar Municipality"],
  "Lamjung": ["Besisahar Municipality", "Sundarbazar Municipality", "Rainas Municipality"],
  "Syangja": ["Putalibazar Municipality", "Waling Municipality", "Chapakot Municipality"],
  "Palpa": ["Tansen Municipality", "Rampur Municipality"],
  "Gulmi": ["Tamghas Municipality", "Resunga Municipality"],
  "Kapilvastu": ["Kapilvastu Municipality", "Buddhabhumi Municipality", "Shivaraj Municipality"],
  "Dailekh": ["Narayan Municipality", "Dullu Municipality"],
  "Bajhang": ["Jayaprithvi Municipality"],
  "Achham": ["Mangalsen Municipality", "Sanfebagar Municipality"],
  "Doti": ["Dipayal-Silgadhi Municipality"],
  "Baitadi": ["Dasharathchand Municipality", "Patan Municipality"],
  "Darchula": ["Mahakali Municipality", "Shailyashikhar Municipality"],
};

const victimTypes = [
  { value: "individual", label: "Individual" },
  { value: "business", label: "Business / Organization" },
  { value: "organization", label: "Government / NGO" },
  { value: "other", label: "Other" },
];

export default function Report() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [caseNumber, setCaseNumber] = useState("");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [identifiers, setIdentifiers] = useState<{type: string; value: string}[]>([]);
  const [identifierType, setIdentifierType] = useState("phone");
  const [identifierValue, setIdentifierValue] = useState("");

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const [submitError, setSubmitError] = useState("");

  const createReport = trpc.report.create.useMutation({
    onSuccess: async (data) => {
      // Upload evidence files if any
      if (uploadedFiles.length > 0) {
        try {
          const fileData = await Promise.all(
            uploadedFiles.map(async (file) => {
              const base64 = await fileToBase64(file);
              return { name: file.name, type: file.type, size: file.size, data: base64 };
            })
          );
          await uploadEvidence.mutateAsync({ reportId: data.id, files: fileData });
        } catch (e) {
          console.error("Evidence upload failed:", e);
        }
      }
      setCaseNumber(data.caseNumber);
      setSubmitted(true);
      setSubmitError("");
    },
    onError: (err) => {
      setSubmitError(err.message || "Failed to submit report. Please try again.");
    }
  });

  const uploadEvidence = trpc.report.uploadEvidence.useMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors: formErrors },
  } = useForm<ReportFormData>({
    defaultValues: {
      currency: "NPR",
      language: "en",
      privacyLevel: "anonymous",
      victimType: "individual",
      isDefamationAcknowledged: false,
    },
  });

  // Manual validation errors
  const [manualErrors, setManualErrors] = useState<Record<string, string>>({});
  const errors = { ...formErrors, ...Object.fromEntries(
    Object.entries(manualErrors).map(([k, v]) => [k, { message: v }])
  ) } as Record<string, { message?: string }>;

  const watchProvince = watch("province");
  const watchDistrict = watch("district");
  const watchCategory = watch("category");

  const handleProvinceChange = (province: string) => {
    setValue("province", province);
    setValue("district", "");
    setValue("municipality", "");
    setSelectedDistricts(districts[province] || []);
    setSelectedMunicipalities([]);
  };

  const handleDistrictChange = (district: string) => {
    setValue("district", district);
    setValue("municipality", "");
    setSelectedMunicipalities(municipalities[district] || []);
  };

  const onSubmit = (data: ReportFormData) => {
    createReport.mutate({ ...data, identifiers } as any);
  };

  const steps = [
    { label: "Category", description: "Select crime type" },
    { label: "Details", description: "Describe the incident" },
    { label: "Location", description: "Where it happened" },
    { label: "Evidence", description: "Upload proof" },
    { label: "Review", description: "Submit report" },
  ];

  const nextStep = async () => {
    const newErrors: Record<string, string> = {};
    const vals = watch();

    if (step === 0 && !vals.category) newErrors.category = "Please select a category";
    if (step === 1) {
      if (!vals.title || vals.title.length < 5) newErrors.title = "Title must be at least 5 characters";
      if (!vals.description || vals.description.length < 20) newErrors.description = "Description must be at least 20 characters";
      if (!vals.incidentDate) newErrors.incidentDate = "Incident date is required";
      if (!vals.victimType) newErrors.victimType = "Victim type is required";
    }
    if (step === 2) {
      if (!vals.province) newErrors.province = "Province is required";
      if (!vals.district) newErrors.district = "District is required";
      if (!vals.municipality) newErrors.municipality = "Municipality is required";
    }
    if (step === 4 && !vals.isDefamationAcknowledged) {
      newErrors.isDefamationAcknowledged = "You must acknowledge that false reporting is punishable";
    }

    setManualErrors(newErrors);
    if (Object.keys(newErrors).length === 0 && step < steps.length - 1) setStep(step + 1);
  };

  const prevStep = () => setStep(Math.max(0, step - 1));

  if (submitted) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-[var(--pashmina-white)]">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h2 className="font-display text-3xl font-bold text-[var(--lattice-wood)] mb-3">
              Report Submitted! 🎉
            </h2>
            <p className="text-[var(--thamel-gray)]/70 mb-6">
              Your report is now in our moderation queue. A moderator will review it within 24-48 hours.
            </p>
            <div className="bg-gradient-to-br from-[var(--prayer-crimson)]/5 to-[var(--lattice-wood)]/5 rounded-xl p-6 mb-6 border border-[var(--prayer-crimson)]/10">
              <p className="text-sm text-[var(--thamel-gray)]/60 mb-2">Your Case Number</p>
              <p className="font-mono text-3xl font-bold text-[var(--prayer-crimson)] tracking-wide">
                {caseNumber}
              </p>
              <p className="text-xs text-[var(--thamel-gray)]/40 mt-2">
                Screenshot or copy this — you'll need it to track your case
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-blue-800 mb-2">What happens next?</p>
              <ul className="text-sm text-blue-700 space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">1.</span> A moderator reviews your evidence</li>
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">2.</span> Status updates to "Under Review"</li>
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">3.</span> You can message the team at any time</li>
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">4.</span> Once verified, action is taken against the suspect</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/track" className="btn-primary">
                Track Your Case
              </Link>
              <Link to="/messages" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                <MessageCircle className="w-4 h-4" />
                Message Team
              </Link>
              <Link to="/" className="px-5 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[var(--pashmina-white)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--lattice-wood)] mb-2">
              Report a Cybercrime
            </h1>
            <p className="text-[var(--thamel-gray)]/70">
              Fill out the form below to report a cybercrime incident. All fields marked with * are required.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      i < step ? "bg-green-500 text-white" :
                      i === step ? "bg-[var(--prayer-crimson)] text-[var(--prayer-gold)]" :
                      "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1 font-medium hidden sm:block ${
                    i === step ? "text-[var(--prayer-crimson)]" : "text-gray-400"
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Disclaimer Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Important Notice</p>
              <p className="text-sm text-amber-700 mt-1">
                False reporting is a punishable offense under the Electronic Transactions Act, 2063 of Nepal.
                Please ensure all information provided is accurate and truthful to the best of your knowledge.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Step 1: Category */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="card p-6"
                >
                  <h3 className="font-display text-xl font-semibold text-[var(--lattice-wood)] mb-4">
                    Select Crime Category
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setValue("category", cat.value as any)}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          watchCategory === cat.value
                            ? "border-[var(--prayer-crimson)] bg-[var(--prayer-crimson)]/5"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <cat.icon className={`w-6 h-6 mx-auto mb-2 ${
                          watchCategory === cat.value ? "text-[var(--prayer-crimson)]" : "text-gray-400"
                        }`} />
                        <span className={`text-sm font-medium ${
                          watchCategory === cat.value ? "text-[var(--prayer-crimson)]" : "text-[var(--thamel-gray)]"
                        }`}>
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-2">{errors.category.message}</p>
                  )}
                </motion.div>
              )}

              {/* Step 2: Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="card p-6 space-y-4"
                >
                  <h3 className="font-display text-xl font-semibold text-[var(--lattice-wood)] mb-4">
                    Incident Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-[var(--lattice-wood)] mb-1">
                      Report Title *
                    </label>
                    <input
                      {...register("title")}
                      className="input-field"
                      placeholder="e.g., eSewa Phishing Website Reported"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--lattice-wood)] mb-1">
                      Description * (minimum 20 characters)
                    </label>
                    <textarea
                      {...register("description")}
                      rows={5}
                      className="input-field resize-none"
                      placeholder="Describe what happened in detail..."
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--lattice-wood)] mb-1">
                        Incident Date *
                      </label>
                      <input
                        type="date"
                        {...register("incidentDate")}
                        className="input-field"
                      />
                      {errors.incidentDate && <p className="text-red-500 text-sm mt-1">{errors.incidentDate.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--lattice-wood)] mb-1">
                        Victim Type *
                      </label>
                      <select {...register("victimType")} className="input-field">
                        <option value="">Select type</option>
                        {victimTypes.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      {errors.victimType && <p className="text-red-500 text-sm mt-1">{errors.victimType.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--lattice-wood)] mb-1">
                        Amount Lost (optional)
                      </label>
                      <div className="flex gap-2">
                        <select {...register("currency")} className="input-field w-28">
                          <option value="NPR">NPR</option>
                          <option value="USD">USD</option>
                          <option value="INR">INR</option>
                        </select>
                        <input
                          type="number"
                          {...register("amountLost", { valueAsNumber: true })}
                          className="input-field flex-1"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--lattice-wood)] mb-1">
                        Language
                      </label>
                      <select {...register("language")} className="input-field">
                        <option value="en">English</option>
                        <option value="ne">Nepali</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Location */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="card p-6 space-y-4"
                >
                  <h3 className="font-display text-xl font-semibold text-[var(--lattice-wood)] mb-4">
                    Incident Location
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-[var(--lattice-wood)] mb-1">
                      Province *
                    </label>
                    <select
                      {...register("province")}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select Province</option>
                      {provinces.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--lattice-wood)] mb-1">
                      District *
                    </label>
                    <select
                      {...register("district")}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="input-field"
                      disabled={!watchProvince}
                    >
                      <option value="">Select District</option>
                      {selectedDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--lattice-wood)] mb-1">
                      Municipality *
                    </label>
                    <select
                      {...register("municipality")}
                      className="input-field"
                      disabled={!watchDistrict}
                    >
                      <option value="">Select Municipality</option>
                      {selectedMunicipalities.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    {errors.municipality && <p className="text-red-500 text-sm mt-1">{errors.municipality.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--lattice-wood)] mb-1">
                      Specific Location (optional)
                    </label>
                    <input
                      {...register("location")}
                      className="input-field"
                      placeholder="e.g., New Baneshwor, Kathmandu"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 4: Evidence */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="card p-6 space-y-4"
                >
                  <h3 className="font-display text-xl font-semibold text-[var(--lattice-wood)] mb-4">
                    Evidence Upload
                  </h3>
                  <p className="text-sm text-[var(--thamel-gray)]/70 mb-4">
                    Upload screenshots, chat logs, transaction receipts, or any other evidence.
                    Supported formats: JPG, PNG, PDF, MP4, MP3, DOC.
                  </p>

                  <label
                    htmlFor="file-upload"
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[var(--prayer-crimson)]/30 transition-colors cursor-pointer block"
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-[var(--prayer-crimson)]", "bg-red-50/30"); }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-[var(--prayer-crimson)]", "bg-red-50/30"); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("border-[var(--prayer-crimson)]", "bg-red-50/30");
                      const droppedFiles = Array.from(e.dataTransfer.files);
                      setUploadedFiles((prev) => [...prev, ...droppedFiles]);
                    }}
                  >
                    <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-[var(--lattice-wood)] mb-1">
                      Drag and drop files here
                    </p>
                    <p className="text-xs text-gray-400">
                      or click to browse (max 50MB per file)
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*,.pdf,.mp4,.mp3,.doc,.docx,.txt,.csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                        }
                      }}
                    />
                  </label>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-sm font-medium text-[var(--lattice-wood)]">
                        {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""} selected
                      </p>
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{file.name}</span>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              ({(file.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 text-xs font-medium ml-2"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {["Image", "PDF", "Video", "Audio", "Screenshot", "Document", "Chat Export"].map((type) => (
                      <div key={type} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-[var(--thamel-gray)]">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {type}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-[var(--lattice-wood)] mb-2">
                      Suspect Identifiers
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Add phone numbers, emails, websites, social media profiles, or wallet IDs of the suspect.
                      These help us track scammers across reports.
                    </p>

                    {/* Add identifier form */}
                    <div className="flex gap-2 mb-3">
                      <select
                        value={identifierType}
                        onChange={(e) => setIdentifierType(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--prayer-crimson)]/20 outline-none"
                      >
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="website">Website/URL</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="telegram">Telegram</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="tiktok">TikTok</option>
                        <option value="esewa">eSewa ID</option>
                        <option value="khalti">Khalti ID</option>
                        <option value="bank_account">Bank Account</option>
                        <option value="business_name">Business Name</option>
                        <option value="domain">Domain</option>
                      </select>
                      <input
                        type="text"
                        value={identifierValue}
                        onChange={(e) => setIdentifierValue(e.target.value)}
                        placeholder="e.g. +977-9801234567"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--prayer-crimson)]/20 outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (identifierValue.trim()) {
                              setIdentifiers([...identifiers, { type: identifierType, value: identifierValue.trim() }]);
                              setIdentifierValue("");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (identifierValue.trim()) {
                            setIdentifiers([...identifiers, { type: identifierType, value: identifierValue.trim() }]);
                            setIdentifierValue("");
                          }
                        }}
                        className="px-4 py-2 bg-[var(--prayer-crimson)] text-white rounded-lg text-sm font-medium hover:brightness-110"
                      >
                        Add
                      </button>
                    </div>

                    {/* List of added identifiers */}
                    {identifiers.length > 0 && (
                      <div className="space-y-1.5">
                        {identifiers.map((id, idx) => (
                          <div key={idx} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded capitalize">{id.type}</span>
                              <span className="text-sm text-gray-800 font-mono">{id.value}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIdentifiers(identifiers.filter((_, i) => i !== idx))}
                              className="text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Review */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="card p-6 space-y-4"
                >
                  <h3 className="font-display text-xl font-semibold text-[var(--lattice-wood)] mb-4">
                    Review &amp; Submit
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category</span>
                      <span className="font-medium text-[var(--lattice-wood)]">{watch("category")?.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Title</span>
                      <span className="font-medium text-[var(--lattice-wood)] text-right max-w-xs">{watch("title")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date</span>
                      <span className="font-medium text-[var(--lattice-wood)]">{watch("incidentDate")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Location</span>
                      <span className="font-medium text-[var(--lattice-wood)]">
                        {watch("municipality")}, {watch("district")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Victim Type</span>
                      <span className="font-medium text-[var(--lattice-wood)]">{watch("victimType")}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--lattice-wood)] mb-1">
                      Privacy Level
                    </label>
                    <div className="flex gap-3">
                      {["public", "anonymous", "private"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setValue("privacyLevel", level as any)}
                          className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                            watch("privacyLevel") === level
                              ? "border-[var(--prayer-crimson)] bg-[var(--prayer-crimson)]/5"
                              : "border-gray-100"
                          }`}
                        >
                          <span className={`text-sm font-medium capitalize ${
                            watch("privacyLevel") === level ? "text-[var(--prayer-crimson)]" : "text-[var(--thamel-gray)]"
                          }`}>
                            {level}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("isDefamationAcknowledged")}
                        className="mt-1 w-4 h-4 text-[var(--prayer-crimson)] rounded"
                      />
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          Defamation Acknowledgment *
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          I acknowledge that this report is based on my genuine experience and that
                          false reporting is a punishable offense under the Electronic Transactions Act, 2063 of Nepal.
                          I understand that providing false information may result in legal action against me.
                        </p>
                      </div>
                    </label>
                    {errors.isDefamationAcknowledged && (
                      <p className="text-red-500 text-sm mt-2 ml-7">{errors.isDefamationAcknowledged.message}</p>
                    )}
                  </div>
                  {submitError && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mt-4 border border-red-200">
                      <p className="font-medium text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Submission Error
                      </p>
                      <p className="text-sm mt-1">{submitError}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  step === 0 ? "opacity-0 pointer-events-none" : "bg-gray-100 text-[var(--thamel-gray)] hover:bg-gray-200"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={createReport.isPending}
                  className="btn-primary disabled:opacity-50"
                >
                  {createReport.isPending ? "Submitting..." : "Submit Report"}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
