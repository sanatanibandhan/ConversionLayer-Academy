import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../lib/firebase';
import { DEFAULT_SERVICES, DEFAULT_CASE_STUDIES, APPLICATION_FORM_URL } from '../../data/syncOpsData';

type DashboardTab = 'services' | 'case_studies' | 'leads';

interface FirestoreServiceItem {
  id: string;
  category?: string;
  title: string;
  tier?: string;
  price?: number;
  turnaround?: string;
  description: string;
  techStack?: string[];
  deliverables?: string[];
  link: string;
  imageUrl?: string;
  ordersCount?: number;
  rating?: number;
  levelBadge?: string;
  recommended?: boolean;
  createdAt?: unknown;
}

interface FirestoreCaseStudyItem {
  id: string;
  client: string;
  clientType?: string;
  challenge: string;
  solution: string;
  result: string;
  imageUrl?: string;
  createdAt?: unknown;
}

interface FirestoreLeadItem {
  id: string;
  websiteUrl: string;
  adPlatform: string;
  monthlyAdSpend: string;
  whatsappNumber: string;
  trackingChallenge?: string;
  serviceTier?: string;
  createdAt?: unknown;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('services');
  const [serviceItems, setServiceItems] = useState<FirestoreServiceItem[]>([]);
  const [caseStudyItems, setCaseStudyItems] = useState<FirestoreCaseStudyItem[]>([]);
  const [leadItems, setLeadItems] = useState<FirestoreLeadItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Service Form State
  const [serviceCategory, setServiceCategory] = useState<string>('Data & Measurement');
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceTier, setServiceTier] = useState('');
  const [serviceTurnaround, setServiceTurnaround] = useState('3-4 Days');
  const [serviceTechStackInput, setServiceTechStackInput] = useState('Meta CAPI, TikTok Events API, Server GTM, Cloud Run, Consent Mode v2');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceLink, setServiceLink] = useState(APPLICATION_FORM_URL);
  const [serviceRecommended, setServiceRecommended] = useState(false);
  const [serviceDeliverables, setServiceDeliverables] = useState<string[]>([
    'Server-Side GTM container deployment (Stape / GCP)',
    'Meta Conversions API (CAPI) with 100% deduplication',
    'Custom subdomain first-party cookie routing',
    'Event Match Quality (EMQ) optimization to 8.5+'
  ]);

  // Case Study Form State
  const [clientName, setClientName] = useState('');
  const [clientType, setClientType] = useState('');
  const [challenge, setChallenge] = useState('');
  const [solution, setSolution] = useState('');
  const [resultMetric, setResultMetric] = useState('');

  // Shared Upload & Submitting State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const navigate = useNavigate();

  // Fetch documents for the active tab
  const fetchCollectionItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      if (activeTab === 'services') {
        const colRef = collection(db, 'services');
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty) {
          const fetched: FirestoreServiceItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            let deliverablesList: string[] = [];
            if (Array.isArray(data.deliverables) && data.deliverables.length > 0) {
              deliverablesList = data.deliverables.filter((d: unknown) => typeof d === 'string' && d.trim().length > 0);
            } else if (data.description) {
              deliverablesList = [data.description];
            }

            let techStackList: string[] = [];
            if (Array.isArray(data.techStack) && data.techStack.length > 0) {
              techStackList = data.techStack.filter((t: unknown) => typeof t === 'string' && t.trim().length > 0);
            } else if (deliverablesList.length > 0) {
              techStackList = ['Server-Side GTM', 'Cloud Run', 'Meta CAPI'];
            }

            return {
              id: docSnap.id,
              category: data.category || 'Data & Measurement',
              title: data.title || 'Untitled Enterprise Capability',
              tier: data.tier || 'Enterprise Capability',
              turnaround: data.turnaround || 'Sprint / Project Basis',
              description: data.description || '',
              techStack: techStackList,
              deliverables: deliverablesList,
              link: data.link || data.applicationUrl || data.calendlyUrl || APPLICATION_FORM_URL,
              imageUrl: data.imageUrl || '',
              ordersCount: Number(data.ordersCount) || 42,
              rating: Number(data.rating) || 5.0,
              recommended: data.recommended !== undefined ? Boolean(data.recommended) : false,
              createdAt: data.createdAt
            };
          });
          setServiceItems(fetched);
        } else {
          setServiceItems(
            DEFAULT_SERVICES.map((s) => ({
              id: s.id,
              category: s.category || 'Data & Measurement',
              title: s.title,
              tier: s.tier,
              turnaround: s.turnaround,
              description: s.description,
              techStack: s.techStack || [],
              deliverables: s.deliverables || [],
              link: s.link || APPLICATION_FORM_URL,
              recommended: s.recommended,
              imageUrl: s.imageUrl || ''
            }))
          );
        }
      } else if (activeTab === 'case_studies') {
        const colRef = collection(db, 'case_studies');
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty) {
          const fetched: FirestoreCaseStudyItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              client: data.client || 'Enterprise Client',
              clientType: data.clientType || 'Brand',
              challenge: data.challenge || '',
              solution: data.solution || '',
              result: data.result || '',
              imageUrl: data.imageUrl || '',
              createdAt: data.createdAt
            };
          });
          setCaseStudyItems(fetched);
        } else {
          setCaseStudyItems(
            DEFAULT_CASE_STUDIES.map((c) => ({
              id: c.id,
              client: c.client,
              clientType: c.clientType,
              challenge: c.challenge,
              solution: c.solution,
              result: c.result,
              imageUrl: c.imageUrl || ''
            }))
          );
        }
      } else if (activeTab === 'leads') {
        const colRef = collection(db, 'leads');
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty) {
          const fetched: FirestoreLeadItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              websiteUrl: data.websiteUrl || '',
              adPlatform: data.adPlatform || 'Meta',
              monthlyAdSpend: data.monthlyAdSpend || 'Under $10k',
              whatsappNumber: data.whatsappNumber || '',
              trackingChallenge: data.trackingChallenge || '',
              serviceTier: data.serviceTier || '',
              createdAt: data.createdAt
            };
          });

          // Sort by newest first
          fetched.sort((a, b) => {
            const getMillis = (ts: unknown): number => {
              if (!ts) return 0;
              if (typeof ts === 'object' && ts !== null) {
                if ('toMillis' in (ts as Record<string, unknown>) && typeof (ts as { toMillis: () => number }).toMillis === 'function') {
                  return (ts as { toMillis: () => number }).toMillis();
                }
                if ('seconds' in (ts as Record<string, unknown>) && typeof (ts as { seconds: number }).seconds === 'number') {
                  return (ts as { seconds: number }).seconds * 1000;
                }
              }
              if (typeof ts === 'string' || typeof ts === 'number') {
                const t = new Date(ts).getTime();
                return isNaN(t) ? 0 : t;
              }
              return 0;
            };
            return getMillis(b.createdAt) - getMillis(a.createdAt);
          });

          setLeadItems(fetched);
        } else {
          setLeadItems([]);
        }
      }
    } catch (err: unknown) {
      console.warn(`Firestore getDocs notice for ${activeTab}:`, err);
      if (activeTab === 'services') {
        setServiceItems(
          DEFAULT_SERVICES.map((s) => ({
            id: s.id,
            title: s.title,
            tier: s.tier,
            price: s.price,
            turnaround: s.turnaround,
            description: s.description,
            link: s.link || APPLICATION_FORM_URL,
            imageUrl: s.imageUrl || ''
          }))
        );
      } else if (activeTab === 'case_studies') {
        setCaseStudyItems(
          DEFAULT_CASE_STUDIES.map((c) => ({
            id: c.id,
            client: c.client,
            clientType: c.clientType,
            challenge: c.challenge,
            solution: c.solution,
            result: c.result,
            imageUrl: c.imageUrl || ''
          }))
        );
      } else {
        setLeadItems([]);
      }
    } finally {
      setLoadingItems(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCollectionItems();
  }, [fetchCollectionItems]);

  // Initial load to populate lead count badge regardless of initial active tab
  useEffect(() => {
    async function loadLeadCount() {
      try {
        const colRef = collection(db, 'leads');
        const snap = await getDocs(colRef);
        if (!snap.empty) {
          const list: FirestoreLeadItem[] = snap.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              websiteUrl: data.websiteUrl || '',
              adPlatform: data.adPlatform || 'Meta',
              monthlyAdSpend: data.monthlyAdSpend || 'Under $10k',
              whatsappNumber: data.whatsappNumber || '',
              trackingChallenge: data.trackingChallenge || '',
              serviceTier: data.serviceTier || '',
              createdAt: data.createdAt
            };
          });
          setLeadItems(list);
        }
      } catch (e) {
        console.warn('Initial lead load error:', e);
      }
    }
    loadLeadCount();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDeliverable = () => {
    setServiceDeliverables((prev) => [...prev, '']);
  };

  const handleUpdateDeliverable = (index: number, val: string) => {
    setServiceDeliverables((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleRemoveDeliverable = (index: number) => {
    setServiceDeliverables((prev) => {
      if (prev.length <= 1) return [''];
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    const cleanTechStack = serviceTechStackInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const cleanDeliverables = serviceDeliverables
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    try {
      const newItemData = {
        category: serviceCategory,
        title: serviceTitle.trim(),
        tier: serviceTier.trim() || 'Enterprise Capability',
        turnaround: serviceTurnaround.trim() || 'Sprint / Project Basis',
        description: serviceDescription.trim(),
        techStack: cleanTechStack.length > 0 ? cleanTechStack : ['Meta CAPI', 'Server GTM', 'GA4'],
        deliverables: cleanDeliverables.length > 0 ? cleanDeliverables : ['Full Enterprise Architecture & QA Handover'],
        link: serviceLink.trim() || APPLICATION_FORM_URL,
        recommended: serviceRecommended,
        imageUrl: '',
        ordersCount: 42,
        rating: 5.0,
        levelBadge: 'Verified Enterprise',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'services'), newItemData);
      setServiceItems((prev) => [
        {
          id: docRef.id,
          ...newItemData
        },
        ...prev
      ]);

      setFeedback({
        type: 'success',
        message: `Capability "${newItemData.title}" (${newItemData.category}) successfully published to Firestore.`
      });

      // Reset Form
      setServiceCategory('Data & Measurement');
      setServiceTitle('');
      setServiceTier('');
      setServiceTurnaround('3-4 Days');
      setServiceTechStackInput('Meta CAPI, TikTok Events API, Server GTM, Cloud Run, Consent Mode v2');
      setServiceDescription('');
      setServiceLink(APPLICATION_FORM_URL);
      setServiceRecommended(false);
      setServiceDeliverables([
        'Server-Side GTM container deployment (Stape / GCP)',
        'Meta Conversions API (CAPI) with 100% deduplication',
        'Custom subdomain first-party cookie routing',
        'Event Match Quality (EMQ) optimization to 8.5+'
      ]);
    } catch (err: unknown) {
      console.error('Error adding service document:', err);
      // Local optimistic fallback
      const localId = `local-service-${Date.now()}`;
      setServiceItems((prev) => [
        {
          id: localId,
          category: serviceCategory,
          title: serviceTitle.trim(),
          tier: serviceTier.trim() || 'Enterprise Capability',
          turnaround: serviceTurnaround.trim() || 'Sprint / Project Basis',
          description: serviceDescription.trim(),
          techStack: cleanTechStack.length > 0 ? cleanTechStack : ['Meta CAPI', 'Server GTM', 'GA4'],
          deliverables: cleanDeliverables.length > 0 ? cleanDeliverables : ['Full Enterprise Architecture & QA Handover'],
          link: serviceLink.trim() || APPLICATION_FORM_URL,
          recommended: serviceRecommended,
          imageUrl: '',
          ordersCount: 42,
          rating: 5.0,
          levelBadge: 'Verified Enterprise'
        },
        ...prev
      ]);
      setFeedback({
        type: 'success',
        message: `Capability "${serviceTitle.trim()}" published (saved to local state).`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCaseStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    let finalImageUrl = imagePreview || '';
    if (imageFile) {
      try {
        const storagePath = `case_studies/${Date.now()}_${imageFile.name}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(storageRef);
      } catch (storageErr) {
        console.warn('Storage upload fallback:', storageErr);
      }
    }

    try {
      const newStudyData = {
        client: clientName.trim(),
        clientType: clientType.trim() || 'High-Growth Brand',
        challenge: challenge.trim(),
        solution: solution.trim(),
        result: resultMetric.trim(),
        imageUrl: finalImageUrl,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'case_studies'), newStudyData);
      setCaseStudyItems((prev) => [
        {
          id: docRef.id,
          ...newStudyData
        },
        ...prev
      ]);

      setFeedback({
        type: 'success',
        message: `Case Study for "${newStudyData.client}" successfully created in Firestore.`
      });

      // Reset Form
      setClientName('');
      setClientType('');
      setChallenge('');
      setSolution('');
      setResultMetric('');
      setImageFile(null);
      setImagePreview('');
    } catch (err: unknown) {
      console.error('Error adding case study document:', err);
      const localId = `local-case-${Date.now()}`;
      setCaseStudyItems((prev) => [
        {
          id: localId,
          client: clientName.trim(),
          clientType: clientType.trim() || 'High-Growth Brand',
          challenge: challenge.trim(),
          solution: solution.trim(),
          result: resultMetric.trim(),
          imageUrl: finalImageUrl
        },
        ...prev
      ]);
      setFeedback({
        type: 'success',
        message: `Case study added (Local update saved. Verify Firestore permissions if cloud write deferred).`
      });
      setClientName('');
      setClientType('');
      setChallenge('');
      setSolution('');
      setResultMetric('');
      setImageFile(null);
      setImagePreview('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    setIsDeletingId(itemId);
    setFeedback(null);

    try {
      if (activeTab === 'services') {
        try {
          await deleteDoc(doc(db, 'services', itemId));
        } catch (e) {
          console.warn('Firestore service delete notification:', e);
        }
        setServiceItems((prev) => prev.filter((item) => item.id !== itemId));
      } else if (activeTab === 'case_studies') {
        try {
          await deleteDoc(doc(db, 'case_studies', itemId));
        } catch (e) {
          console.warn('Firestore case study delete notification:', e);
        }
        setCaseStudyItems((prev) => prev.filter((item) => item.id !== itemId));
      } else if (activeTab === 'leads') {
        try {
          await deleteDoc(doc(db, 'leads', itemId));
        } catch (e) {
          console.warn('Firestore lead delete notification:', e);
        }
        setLeadItems((prev) => prev.filter((item) => item.id !== itemId));
      }

      setFeedback({
        type: 'success',
        message: `Item deleted successfully.`
      });
    } catch (err: unknown) {
      console.error('Failed to delete item:', err);
      setFeedback({
        type: 'error',
        message: 'Could not delete item. Please check your Firestore rules.'
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div id="admin-dashboard-page" className="min-h-screen bg-slate-950 text-slate-300 antialiased flex flex-col">
      {/* Top Admin Header Bar */}
      <header id="admin-top-bar" className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo & Tag */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/30 transition-all">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg tracking-tight">SyncOps Studio</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-xs font-mono font-semibold">
                      Admin Terminal
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">DATABASE &amp; CASE STUDY ENGINE</span>
                </div>
              </Link>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                id="admin-view-site-link"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all min-h-[44px]"
              >
                <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span>Live Site</span>
              </Link>

              <button
                type="button"
                id="admin-logout-btn"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-mono font-semibold transition-all min-h-[44px]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Navigation Tabs for Categories */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Agency Master Operations
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage live Firestore collections for client case studies and Done-For-You consulting packages.
            </p>
          </div>

          {/* Tab Selector Buttons */}
          <div
            id="admin-tab-controls"
            className="flex items-center p-1.5 rounded-xl bg-slate-900 border border-slate-800"
            role="tablist"
          >
            <button
              type="button"
              id="admin-tab-services"
              role="tab"
              aria-selected={activeTab === 'services'}
              onClick={() => {
                setActiveTab('services');
                setFeedback(null);
              }}
              className={`min-h-[44px] px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'services'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
              <span>DFY Services</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-300">
                {serviceItems.length}
              </span>
            </button>

            <button
              type="button"
              id="admin-tab-case-studies"
              role="tab"
              aria-selected={activeTab === 'case_studies'}
              onClick={() => {
                setActiveTab('case_studies');
                setFeedback(null);
              }}
              className={`min-h-[44px] px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'case_studies'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span>Case Studies</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-300">
                {caseStudyItems.length}
              </span>
            </button>

            <button
              type="button"
              id="admin-tab-leads"
              role="tab"
              aria-selected={activeTab === 'leads'}
              onClick={() => {
                setActiveTab('leads');
                setFeedback(null);
              }}
              className={`min-h-[44px] px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'leads'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Incoming Leads</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-300">
                {leadItems.length}
              </span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            id="admin-feedback-banner"
            className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}
          >
            <div className="mt-0.5">
              {feedback.type === 'success' ? (
                <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium">{feedback.message}</p>
          </div>
        )}

        {/* TAB 1: ENTERPRISE CAPABILITIES CRUD */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Create Capability Form */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <h2 className="text-xl font-bold text-white tracking-tight">Add Enterprise Capability</h2>
              </div>

              <form onSubmit={handleAddService} className="space-y-4">
                {/* Category Dropdown (Required) */}
                <div>
                  <label htmlFor="admin-service-category" className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    id="admin-service-category"
                    required
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Data & Measurement">1. Data & Measurement (Tracking, CAPI, Analytics)</option>
                    <option value="E-Commerce Engineering">2. E-Commerce Engineering (Shopify, WordPress, GMC)</option>
                    <option value="Growth Operations">3. Growth Operations (SEO, Social Media Management)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    placeholder="e.g. Omnichannel Server-Side CAPI"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Sub-Tier / Scope Badge *
                    </label>
                    <input
                      type="text"
                      required
                      value={serviceTier}
                      onChange={(e) => setServiceTier(e.target.value)}
                      placeholder="e.g. Core Architecture"
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Delivery Timeline / SLA
                    </label>
                    <input
                      type="text"
                      value={serviceTurnaround}
                      onChange={(e) => setServiceTurnaround(e.target.value)}
                      placeholder="e.g. 3-4 Days or Sprints"
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Included Tech Stack / Platforms (Comma Separated) */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Included Tech Stack &amp; Platforms (Comma-Separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceTechStackInput}
                    onChange={(e) => setServiceTechStackInput(e.target.value)}
                    placeholder="e.g. Meta, TikTok, GA4, Consent Mode V2, Shopify"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] font-mono text-slate-500 block mt-1">
                    Tags rendered as high-contrast pills on the capability card.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Application Form URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={serviceLink}
                    onChange={(e) => setServiceLink(e.target.value)}
                    placeholder={APPLICATION_FORM_URL}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Technical Overview &amp; Description *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    placeholder="Highly technical, enterprise-focused overview of this capability..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Dynamic Deliverables List */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                      Deliverable Protocols ({serviceDeliverables.length})
                    </label>
                  </div>

                  <div className="space-y-2.5">
                    {serviceDeliverables.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          required
                          value={item}
                          onChange={(e) => handleUpdateDeliverable(idx, e.target.value)}
                          placeholder={`Protocol ${idx + 1} (e.g. Meta Conversions API with 100% deduplication)`}
                          className="flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveDeliverable(idx)}
                          className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700/60 flex items-center justify-center transition-colors shrink-0"
                          title="Remove Protocol"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="mt-3 w-full py-2 px-3 rounded-xl border border-dashed border-indigo-500/40 hover:border-indigo-500 bg-indigo-950/20 hover:bg-indigo-950/40 text-indigo-300 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Add Another Protocol</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="admin-service-recommended"
                    checked={serviceRecommended}
                    onChange={(e) => setServiceRecommended(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="admin-service-recommended" className="text-xs text-slate-300 font-medium cursor-pointer">
                    Highlight as &quot;Featured Capability&quot; (Glowing indigo border)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[44px] mt-3 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Publishing to Firestore...</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>Publish Capability to Matrix</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Existing Services / Capabilities List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Active Enterprise Capabilities</h3>
                <span className="text-xs font-mono text-slate-400">Collection: `services`</span>
              </div>

              {loadingItems ? (
                <div className="p-12 text-center text-slate-400 font-mono text-sm">
                  Loading capabilities from Firestore...
                </div>
              ) : serviceItems.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-sm">
                  No capabilities found. Add your first service capability using the form.
                </div>
              ) : (
                serviceItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-5 sm:p-6 rounded-2xl bg-slate-900 border transition-all ${
                      item.recommended
                        ? 'border-indigo-500/70 shadow-lg shadow-indigo-950/40'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          {/* Category Badge */}
                          <span
                            className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                              item.category === 'E-Commerce Engineering'
                                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/70'
                                : item.category === 'Growth Operations'
                                ? 'bg-amber-950/70 text-amber-300 border-amber-800/70'
                                : 'bg-indigo-950/70 text-indigo-300 border-indigo-800/70'
                            }`}
                          >
                            {item.category || 'Data & Measurement'}
                          </span>

                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                            {item.tier || 'Enterprise Scope'}
                          </span>

                          {item.recommended && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-extrabold uppercase tracking-wider shadow-sm">
                              Featured
                            </span>
                          )}

                          {item.turnaround && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                              ⚡ {item.turnaround}
                            </span>
                          )}
                        </div>
                        <h4 className="text-base sm:text-lg font-extrabold text-white">{item.title}</h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{item.description}</p>

                    {/* Tech Stack Pills Preview */}
                    {item.techStack && item.techStack.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                        {item.techStack.map((tech, tIdx) => (
                          <span key={tIdx} className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-slate-950 text-indigo-300 border border-slate-800/90 font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Deliverables checklist preview */}
                    {item.deliverables && item.deliverables.length > 0 && (
                      <div className="mb-4 pt-3 border-t border-slate-800/80">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-semibold">
                          Included Protocols ({item.deliverables.length}):
                        </span>
                        <ul className="space-y-1.5">
                          {item.deliverables.map((deliv, dIdx) => (
                            <li key={dIdx} className="flex items-start gap-2 text-xs text-slate-300">
                              <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>{deliv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        disabled={isDeletingId === item.id}
                        onClick={() => handleDeleteItem(item.id)}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        <span>Delete Capability</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CASE STUDIES CRUD */}
        {activeTab === 'case_studies' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Create Case Study Form */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="text-xl font-bold text-white tracking-tight">Add Client Case Study</h2>
              </div>

              <form onSubmit={handleAddCaseStudy} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Velour & Oak (Shopify Plus)"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Client Type / Sector
                  </label>
                  <input
                    type="text"
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value)}
                    placeholder="e.g. E-Commerce Fashion ($12M ARR)"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Tracking Challenge *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    placeholder="Explain the signal loss, iOS restrictions, or ad spend inefficiency..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Server-Side Solution *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Details of the GTM container, CAPI deduplication, or first-party subdomain deployed..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Result Metric *
                  </label>
                  <input
                    type="text"
                    required
                    value={resultMetric}
                    onChange={(e) => setResultMetric(e.target.value)}
                    placeholder="e.g. +41% Attributed ROAS • Meta EMQ 9.6/10 • $140k Recovered"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Optional Image Upload */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Case Study Screenshot / Asset (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-indigo-950 file:text-indigo-300 hover:file:bg-indigo-900 cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[44px] mt-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Saving to Firestore...</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>Publish Case Study</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Existing Case Studies List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Active Case Studies</h3>
                <span className="text-xs font-mono text-slate-400">Collection: `case_studies`</span>
              </div>

              {loadingItems ? (
                <div className="p-12 text-center text-slate-400 font-mono text-sm">
                  Loading case studies from Firestore...
                </div>
              ) : caseStudyItems.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-sm">
                  No case studies recorded yet. Add your first success metric above.
                </div>
              ) : (
                caseStudyItems.map((study) => (
                  <div
                    key={study.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{study.client}</span>
                        {study.clientType && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 text-indigo-400 border border-slate-800">
                            {study.clientType}
                          </span>
                        )}
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs font-mono text-emerald-300 mt-1">
                        🎯 {study.result}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        <strong className="text-slate-300">Challenge:</strong> {study.challenge}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        disabled={isDeletingId === study.id}
                        onClick={() => handleDeleteItem(study.id)}
                        className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: INCOMING LEADS PIPELINE */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* CRM Pipeline Header Bar */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h2 className="text-xl font-bold text-white tracking-tight">Direct Lead Pipeline</h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-indigo-400 border border-slate-800">
                    Collection: `leads`
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  High-ticket client applications submitted via the native intake modal. Sorted by newest first.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="admin-refresh-leads-btn"
                  onClick={() => fetchCollectionItems()}
                  disabled={loadingItems}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-medium flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className={`w-4 h-4 ${loadingItems ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6" />
                    <path d="M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  <span>Refresh Pipeline</span>
                </button>
              </div>
            </div>

            {/* Lead Statistics Quick Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Total Leads</span>
                <span className="text-2xl font-extrabold font-mono text-white">{leadItems.length}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">High Spend ($50k+)</span>
                <span className="text-2xl font-extrabold font-mono text-emerald-400">
                  {leadItems.filter((l) => l.monthlyAdSpend === '$50k+').length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Meta Platform</span>
                <span className="text-2xl font-extrabold font-mono text-indigo-400">
                  {leadItems.filter((l) => l.adPlatform === 'Meta').length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Google &amp; Other</span>
                <span className="text-2xl font-extrabold font-mono text-amber-400">
                  {leadItems.filter((l) => l.adPlatform !== 'Meta').length}
                </span>
              </div>
            </div>

            {/* Leads List */}
            {loadingItems ? (
              <div className="p-16 text-center text-slate-400 font-mono text-sm">
                Loading incoming leads from Firestore `leads` collection...
              </div>
            ) : leadItems.length === 0 ? (
              <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white">No incoming leads captured yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  When prospective clients click &quot;Submit Architecture Application&quot; in the Services section, their project details will automatically stream into this terminal in real time.
                </p>
                <div className="pt-2">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold transition-colors"
                  >
                    <span>Test Application on Live Site</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {leadItems.map((lead) => {
                  const cleanPhone = lead.whatsappNumber.replace(/[^0-9]/g, '');
                  const triageMessage = `Hi! This is Adesh from SyncOps Studio. I received your tracking architecture application for ${lead.websiteUrl}. Let's discuss your signal setup.`;
                  const waChatLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(triageMessage)}`;
                  const formattedWebUrl = lead.websiteUrl.startsWith('http://') || lead.websiteUrl.startsWith('https://')
                    ? lead.websiteUrl
                    : `https://${lead.websiteUrl}`;

                  const formatTimestamp = (ts: unknown): string => {
                    if (!ts) return 'Recent';
                    try {
                      if (typeof ts === 'object' && ts !== null) {
                        if ('toDate' in (ts as Record<string, unknown>) && typeof (ts as { toDate: () => Date }).toDate === 'function') {
                          return (ts as { toDate: () => Date }).toDate().toLocaleString();
                        }
                        if ('seconds' in (ts as Record<string, unknown>) && typeof (ts as { seconds: number }).seconds === 'number') {
                          return new Date((ts as { seconds: number }).seconds * 1000).toLocaleString();
                        }
                      }
                      if (typeof ts === 'string' || typeof ts === 'number') {
                        const d = new Date(ts);
                        if (!isNaN(d.getTime())) return d.toLocaleString();
                      }
                      return 'Recent';
                    } catch {
                      return 'Recent';
                    }
                  };

                  return (
                    <div
                      key={lead.id}
                      id={`lead-card-${lead.id}`}
                      className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      {/* Left Details */}
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {/* Domain / Website URL */}
                          <a
                            href={formattedWebUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-bold text-white hover:text-indigo-400 flex items-center gap-1.5 group transition-colors"
                          >
                            <span>{lead.websiteUrl}</span>
                            <svg className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>

                          {/* Service Tier if recorded */}
                          {lead.serviceTier && (
                            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                              {lead.serviceTier}
                            </span>
                          )}

                          {/* Submission Timestamp */}
                          <span className="text-[11px] font-mono text-slate-500">
                            {formatTimestamp(lead.createdAt)}
                          </span>
                        </div>

                        {/* Metadata Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Ad Platform Badge */}
                          <span
                            className={`text-xs font-mono px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${
                              lead.adPlatform === 'Meta'
                                ? 'bg-blue-950/60 border-blue-800/80 text-blue-300'
                                : lead.adPlatform === 'Google'
                                ? 'bg-amber-950/60 border-amber-800/80 text-amber-300'
                                : lead.adPlatform === 'TikTok'
                                ? 'bg-fuchsia-950/60 border-fuchsia-800/80 text-fuchsia-300'
                                : 'bg-slate-950 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span>Platform:</span>
                            <strong>{lead.adPlatform}</strong>
                          </span>

                          {/* Monthly Ad Spend Badge */}
                          <span
                            className={`text-xs font-mono px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${
                              lead.monthlyAdSpend === '$50k+'
                                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                                : lead.monthlyAdSpend === '$10k-$50k'
                                ? 'bg-indigo-950/60 border-indigo-800/80 text-indigo-300'
                                : 'bg-slate-950 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span>Spend:</span>
                            <strong>{lead.monthlyAdSpend}</strong>
                          </span>

                          {/* WhatsApp Display Badge */}
                          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.3" />
                            </svg>
                            <span>{lead.whatsappNumber}</span>
                          </span>
                        </div>

                        {/* Primary Tracking Challenge Box */}
                        {lead.trackingChallenge && (
                          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
                            <strong className="text-slate-400 font-mono text-[11px] uppercase block mb-1">
                              Tracking Challenge:
                            </strong>
                            <p className="italic text-slate-300">{lead.trackingChallenge}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons: Chat on WhatsApp + Delete */}
                      <div className="flex flex-row lg:flex-col items-center sm:items-stretch gap-2 shrink-0">
                        {/* Chat on WhatsApp Button */}
                        <a
                          href={waChatLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          id={`lead-wa-chat-${lead.id}`}
                          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.3" />
                          </svg>
                          <span>Chat on WhatsApp</span>
                        </a>

                        {/* Delete Lead Button */}
                        <button
                          type="button"
                          id={`lead-delete-${lead.id}`}
                          disabled={isDeletingId === lead.id}
                          onClick={() => handleDeleteItem(lead.id)}
                          className="min-h-[40px] px-3 py-2 rounded-xl bg-slate-950 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/60 text-xs font-mono transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
