import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit3, Trash2, ArrowLeft, Star, Image as ImageIcon, FolderPlus, Layers, ExternalLink, Sparkles, Settings, Copy, UploadCloud, Loader2, Upload, ChevronUp, ChevronDown, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { artworkService } from '../../services/artworkService';
import { Artwork, ArtworkStatus, ImageType, Category } from '../../types/database.types';
import { uploadImageFile, uploadMultipleImageFiles } from '../../services/storageService';
import {
  getSavedChatGPTUrl,
  saveChatGPTUrl,
  formatArtworkPrompt,
  launchChatGPTConversation,
  copyImageToClipboard,
  DEFAULT_CHATGPT_CONVERSATION_URL,
} from '../../utils/chatGptHelper';
import { SEO } from '../../components/layout/SEO';
import { useArtworksSync } from '../../utils/useArtworksSync';

interface ImageRowState {
  id?: string;
  url: string;
  type: ImageType;
}

export const AdminArtworks: React.FC = () => {
  useArtworksSync();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ArtworkStatus>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

  // ChatGPT State
  const [chatGptUrl, setChatGptUrl] = useState<string>(getSavedChatGPTUrl());
  const [showChatGptSettings, setShowChatGptSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUpdateChatGptUrl = (newUrl: string) => {
    setChatGptUrl(newUrl);
    saveChatGPTUrl(newUrl);
  };

  // Category State
  const [allCategories, setAllCategories] = useState<Category[]>(artworkService.getCategories());
  const mainCategories = allCategories.filter(c => !c.parentId);

  // New Category Form State
  const [catFormData, setCatFormData] = useState({
    name: '',
    parentId: '',
    description: '',
  });
  const [savingCategory, setSavingCategory] = useState(false);

  const refreshCategories = () => {
    setAllCategories(artworkService.getCategories());
  };

  React.useEffect(() => {
    refreshCategories();
    const handleUpdate = () => {
      refreshCategories();
    };
    window.addEventListener('dhruvi_artworks_updated', handleUpdate);
    return () => window.removeEventListener('dhruvi_artworks_updated', handleUpdate);
  }, []);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCategory(true);
    try {
      await artworkService.saveCategoryAsync({
        name: catFormData.name,
        parentId: catFormData.parentId || null,
        description: catFormData.description,
      });
      refreshCategories();
      setCatFormData({ name: '', parentId: '', description: '' });
    } catch (err) {
      console.error('Failed saving category:', err);
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category/subcategory?')) {
      await artworkService.deleteCategoryAsync(id);
      refreshCategories();
    }
  };

  // Form State for Painting
  const [formData, setFormData] = useState({
    title: '',
    price: 95000,
    medium: 'Oil & 24K Gold Leaf on Linen Canvas',
    width: 36,
    height: 48,
    year: 2025,
    status: 'available' as ArtworkStatus,
    categoryId: 'c1000000-0000-0000-0000-000000000001',
    subCategoryId: '',
    featured: false,
    description: '',
  });

  // Dynamic Subcategories based on selected categoryId
  const availableSubCategories = allCategories.filter(c => c.parentId === formData.categoryId);

  // Dynamic Multi-Photo Rows State
  const [imageRows, setImageRows] = useState<ImageRowState[]>([
    { url: '/hero-koi.jpg', type: 'primary' }
  ]);

  // Image Upload & Drag-and-Drop States
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ completed: number; total: number } | null>(null);
  const [isDraggingOverMain, setIsDraggingOverMain] = useState(false);
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);

  const defaultTypes: ImageType[] = ['primary', 'angled', 'detail', 'room', 'back'];

  const processUploadedFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingImages(true);
    setUploadProgress({ completed: 0, total: files.length });

    try {
      const results = await uploadMultipleImageFiles(files, 'artworks', (completed, total) => {
        setUploadProgress({ completed, total });
      });

      if (results.length > 0) {
        setImageRows(prev => {
          // If only 1 row exists and it is empty or default hero koi, replace it
          const isInitialDefault = prev.length === 1 && (!prev[0].url || prev[0].url === '/hero-koi.jpg');
          const baseList = isInitialDefault ? [] : prev.filter(r => r.url.trim() !== '');

          const newRows: ImageRowState[] = results.map((res, i) => {
            const overallIndex = baseList.length + i;
            const assignedType = overallIndex < defaultTypes.length ? defaultTypes[overallIndex] : 'detail';
            return {
              id: `f${(Date.now() + i).toString(16).padStart(31, '0').slice(0, 31)}`,
              url: res.url,
              type: assignedType,
            };
          });

          return [...baseList, ...newRows];
        });

        setToastMessage(`Successfully uploaded ${results.length} image${results.length > 1 ? 's' : ''}!`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setToastMessage('Failed to upload image(s). Please try again.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const handleMainDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverMain(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        await processUploadedFiles(imageFiles);
      } else {
        setToastMessage('Please drop valid image files (JPG, PNG, WebP, etc.)');
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
  };

  const handleMainFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processUploadedFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRowFileDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverRowIndex(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setIsUploadingImages(true);
        try {
          const res = await uploadImageFile(file);
          updateImageRow(index, 'url', res.url);
          setToastMessage(`Replaced photo ${index + 1} with ${file.name}`);
          setTimeout(() => setToastMessage(null), 3000);
        } catch (err) {
          console.error('Row upload failed:', err);
        } finally {
          setIsUploadingImages(false);
        }
      }
    }
  };

  const handleRowFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploadingImages(true);
      try {
        const res = await uploadImageFile(file);
        updateImageRow(index, 'url', res.url);
        setToastMessage(`Uploaded image for photo ${index + 1}`);
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        console.error('Row upload failed:', err);
      } finally {
        setIsUploadingImages(false);
      }
      e.target.value = '';
    }
  };

  const moveImageRow = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === imageRows.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    setImageRows(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleModalPaste = async (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const imageFiles = Array.from(e.clipboardData.files).filter(f => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        e.preventDefault();
        await processUploadedFiles(imageFiles);
      }
    }
  };

  const addImageRow = () => {
    setImageRows(prev => [...prev, { url: '', type: 'angled' }]);
  };

  const removeImageRow = (index: number) => {
    if (imageRows.length > 1) {
      setImageRows(prev => prev.filter((_, i) => i !== index));
    } else {
      // If only 1 row, clear url rather than deleting row
      setImageRows([{ url: '', type: 'primary' }]);
    }
  };

  const updateImageRow = (index: number, field: 'url' | 'type', value: string) => {
    setImageRows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleCopyImageOnly = async (specificImgUrl?: string) => {
    const activeImages = imageRows.filter(r => r.url.trim().length > 0);
    const targetImage = specificImgUrl || (activeImages[0] ? activeImages[0].url : '');
    if (!targetImage) {
      setToastMessage('Please enter an image path or URL first!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const copied = await copyImageToClipboard(targetImage);
    if (copied) {
      setToastMessage('Image file copied to clipboard! Press Ctrl+V in ChatGPT to attach photo.');
    } else {
      setToastMessage('Failed to copy image to clipboard. Check image path.');
    }
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleLaunchChatGPTModalForm = async (specificImgUrl?: string) => {
    const selectedCat = allCategories.find(c => c.id === formData.categoryId);
    const selectedSub = allCategories.find(c => c.id === formData.subCategoryId);
    const activeImages = imageRows.filter(r => r.url.trim().length > 0);
    const targetImage = specificImgUrl || (activeImages[0] ? activeImages[0].url : '');

    const promptText = formatArtworkPrompt({
      title: formData.title || 'Untitled Painting',
      medium: formData.medium,
      width: Number(formData.width),
      height: Number(formData.height),
      year: Number(formData.year),
      price: Number(formData.price),
      categoryName: selectedCat?.name,
      subCategoryName: selectedSub?.name,
      description: formData.description,
      images: targetImage
        ? [{ url: targetImage, type: 'primary' }]
        : activeImages.map(img => ({ url: img.url, type: img.type })),
    });

    const res = await launchChatGPTConversation(promptText, targetImage, chatGptUrl);

    if (res.imageCopied) {
      setToastMessage('Image file copied to clipboard! Press Ctrl+V in ChatGPT to paste photo.');
    } else if (res.textCopied) {
      setToastMessage('Prompt copied to clipboard! Press Ctrl+V in ChatGPT to paste.');
    } else {
      setToastMessage('Launching ChatGPT conversation...');
    }
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleLaunchChatGPTFromTable = async (art: Artwork) => {
    const primaryImg = art.images[0]?.storagePath || '/hero-koi.jpg';
    const promptText = formatArtworkPrompt({
      title: art.title,
      medium: art.medium,
      width: art.width,
      height: art.height,
      year: art.year,
      price: art.price,
      categoryName: art.categoryName,
      subCategoryName: art.subCategoryName,
      description: art.description,
      images: art.images.map(i => ({ url: i.storagePath, type: i.imageType || 'primary' })),
    });

    const res = await launchChatGPTConversation(promptText, primaryImg, chatGptUrl);

    if (res.imageCopied) {
      setToastMessage(`Image file for "${art.title}" copied! Press Ctrl+V in ChatGPT to paste photo.`);
    } else if (res.textCopied) {
      setToastMessage(`Prompt for "${art.title}" copied! Press Ctrl+V in ChatGPT to paste.`);
    } else {
      setToastMessage(`Launching ChatGPT for "${art.title}"...`);
    }
    setTimeout(() => setToastMessage(null), 5000);
  };

  const { artworks, totalCount, totalPages } = artworkService.getArtworks({
    searchQuery,
    status: statusFilter === 'all' ? undefined : (statusFilter as any),
    page,
    limit: pageSize,
  });

  const handleStatusToggle = (id: string, newStatus: ArtworkStatus) => {
    artworkService.updateArtworkStatus(id, newStatus);
    setPage(prev => prev); // re-trigger render
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this artwork record?')) {
      artworkService.deleteArtwork(id);
      setPage(1);
    }
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const selectedCategoryObj = allCategories.find(c => c.id === formData.categoryId);
      const selectedSubCategoryObj = allCategories.find(c => c.id === formData.subCategoryId);

      const validImages = imageRows
        .filter(row => row.url.trim() !== '')
        .map((row, idx) => ({
          id: (row.id && artworkService.isUUID(row.id)) ? row.id : undefined,
          storagePath: row.url.trim(),
          imageType: row.type,
          altText: formData.title,
          sortOrder: idx + 1,
        }));

      const finalImages = validImages.length > 0 ? validImages : [
        {
          storagePath: '/hero-koi.jpg',
          imageType: 'primary' as ImageType,
          altText: formData.title,
          sortOrder: 1,
        }
      ];

      await artworkService.saveArtworkAsync({
        id: editingArtwork ? editingArtwork.id : undefined,
        title: formData.title,
        price: Number(formData.price),
        medium: formData.medium,
        width: Number(formData.width),
        height: Number(formData.height),
        year: Number(formData.year),
        categoryId: formData.categoryId,
        categoryName: selectedCategoryObj?.name || 'Oil on Canvas',
        categorySlug: selectedCategoryObj?.slug || 'oil-on-canvas',
        subCategoryId: formData.subCategoryId || null,
        subCategoryName: selectedSubCategoryObj?.name,
        subCategorySlug: selectedSubCategoryObj?.slug,
        status: formData.status,
        featured: formData.featured,
        description: formData.description || `Original painting ${formData.title} by Dhruvi.`,
        images: finalImages,
      });

      setShowAddModal(false);
      setEditingArtwork(null);
    } catch (err) {
      console.error('Failed saving artwork:', err);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (art: Artwork) => {
    setEditingArtwork(art);
    setFormData({
      title: art.title,
      price: art.price,
      medium: art.medium,
      width: art.width,
      height: art.height,
      year: art.year,
      status: art.status,
      categoryId: art.categoryId || 'c1000000-0000-0000-0000-000000000001',
      subCategoryId: art.subCategoryId || '',
      featured: art.featured,
      description: art.description,
    });

    if (art.images && art.images.length > 0) {
      setImageRows(art.images.map(img => ({
        id: img.id,
        url: img.storagePath,
        type: img.imageType || 'primary',
      })));
    } else {
      setImageRows([{ url: '', type: 'primary' }]);
    }

    setShowAddModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-fadeIn relative">
      <SEO title="Artwork Inventory Manager" noindex={true} />
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-950 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 text-xs border border-emerald-500 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gallery-border pb-4">
        <div>
          <Link to="/admin/dashboard" className="text-xs text-gallery-muted hover:text-gallery-dark flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="font-serif text-3xl text-gallery-dark font-medium">Artwork Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-3.5 py-2 border border-gallery-gold/40 hover:bg-gallery-gold/10 text-gallery-gold-dark rounded text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={() => {
              setEditingArtwork(null);
              setFormData({
                title: '',
                price: 95000,
                medium: 'Oil & 24K Gold Leaf on Linen Canvas',
                width: 36,
                height: 48,
                year: 2025,
                status: 'available',
                categoryId: mainCategories[0]?.id || 'c1000000-0000-0000-0000-000000000001',
                subCategoryId: '',
                featured: false,
                description: '',
              });
              setImageRows([
                { url: '/hero-koi.jpg', type: 'primary' }
              ]);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-gallery-dark hover:bg-gallery-gold text-white rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Painting</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gallery-border shadow-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gallery-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search artworks by title or medium..."
            className="w-full pl-9 pr-4 py-2 bg-gallery-bg border border-gallery-border rounded text-sm text-gallery-dark focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gallery-muted">Status:</span>
          {(['all', 'available', 'reserved', 'sold', 'archived'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1 rounded text-xs capitalize transition-all ${
                statusFilter === st ? 'bg-gallery-dark text-white font-medium' : 'bg-gallery-card text-gallery-dark hover:bg-gallery-border'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Artworks Table */}
      <div className="bg-white border border-gallery-border rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gallery-dark">
            <thead className="bg-gallery-card border-b border-gallery-border font-serif uppercase tracking-wider text-[11px] text-gallery-muted">
              <tr>
                <th className="p-3">Painting</th>
                <th className="p-3">Medium & Dimensions</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gallery-border/60">
              {artworks.map((art) => {
                const imgUrl = art.images[0]?.storagePath || '/hero-koi.jpg';
                return (
                  <tr key={art.id} className="hover:bg-gallery-bg/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={imgUrl} alt={art.title} className="w-12 h-14 object-cover rounded border" />
                        <div>
                          <span className="font-serif text-sm font-medium text-gallery-dark block">
                            {art.title}
                          </span>
                          {art.featured && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700">
                              <Star className="w-3 h-3 fill-amber-500" /> Featured
                            </span>
                          )}
                          <span className="text-[10px] text-gallery-muted block">
                            {art.images.length} photo{art.images.length === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <p className="font-medium text-gallery-dark truncate max-w-xs">{art.medium}</p>
                      <p className="text-[11px] text-gallery-muted">{art.width}" × {art.height}" • {art.year}</p>
                    </td>

                    <td className="p-3 font-serif font-semibold text-sm">
                      ₹{art.price.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3">
                      <select
                        value={art.status}
                        onChange={(e) => handleStatusToggle(art.id, e.target.value as ArtworkStatus)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded border focus:outline-none ${
                          art.status === 'available' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          art.status === 'sold' ? 'bg-red-50 text-red-800 border-red-300' :
                          'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="available">AVAILABLE</option>
                        <option value="reserved">RESERVED</option>
                        <option value="sold">SOLD</option>
                        <option value="archived">ARCHIVED</option>
                      </select>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleLaunchChatGPTFromTable(art)}
                          className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors flex items-center gap-1 text-[11px] font-medium"
                          title="Launch ChatGPT Conversation with prompt & image link"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">ChatGPT</span>
                        </button>

                        <button
                          onClick={() => openEditModal(art)}
                          className="p-1.5 text-gallery-muted hover:text-gallery-dark transition-colors"
                          title="Edit Painting"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(art.id)}
                          className="p-1.5 text-gallery-muted hover:text-red-600 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {artworks.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gallery-muted">
                    No artworks found matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Summary Controls */}
        <div className="px-4 py-3 bg-gallery-bg/50 border-t border-gallery-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gallery-muted">
          <div className="flex items-center gap-4">
            <span>
              Showing <span className="font-semibold text-gallery-dark">{totalCount > 0 ? (page - 1) * pageSize + 1 : 0}</span> to{' '}
              <span className="font-semibold text-gallery-dark">{Math.min(page * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold text-gallery-dark">{totalCount}</span> paintings
            </span>

            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-gallery-border rounded px-2 py-0.5 text-xs text-gallery-dark font-medium focus:outline-none cursor-pointer"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-2.5 py-1.5 rounded border border-gallery-border bg-white text-gallery-dark hover:border-gallery-gold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center space-x-1 px-1">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNum = index + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`min-w-[28px] h-7 px-2 rounded text-xs font-medium transition-all ${
                          page === pageNum
                            ? 'bg-gallery-dark text-white font-semibold shadow-xs'
                            : 'bg-white border border-gallery-border text-gallery-dark hover:border-gallery-gold'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === page - 2 || pageNum === page + 2) {
                    return <span key={pageNum} className="px-1 text-gallery-muted">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 rounded border border-gallery-border bg-white text-gallery-dark hover:border-gallery-gold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                title="Next Page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add / Edit Artwork */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onPaste={handleModalPaste}
        >
          <div className="bg-gallery-bg border border-gallery-border rounded-xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gallery-border pb-3">
              <div>
                <h3 className="font-serif text-xl font-medium text-gallery-dark">
                  {editingArtwork ? 'Edit Artwork' : 'Add New Original Painting'}
                </h3>
                <p className="text-[11px] text-gallery-muted">
                  Drag & drop image files, paste with Ctrl+V, or provide system/web URLs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-gallery-muted hover:text-gallery-dark uppercase font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gallery-dark">Painting Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                  placeholder="e.g. Lumina No. 4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gallery-dark">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gallery-dark">Year *</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                  />
                </div>
              </div>

              {/* CATEGORY & SUBCATEGORY SELECTORS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gallery-dark">Main Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => {
                      const newCatId = e.target.value;
                      setFormData({ ...formData, categoryId: newCatId, subCategoryId: '' });
                    }}
                    className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold font-medium"
                  >
                    {mainCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gallery-dark">Subcategory</label>
                  <select
                    value={formData.subCategoryId}
                    onChange={e => setFormData({ ...formData, subCategoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold font-medium"
                  >
                    <option value="">-- None (Main Category Only) --</option>
                    {availableSubCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gallery-dark">Medium *</label>
                <input
                  type="text"
                  required
                  value={formData.medium}
                  onChange={e => setFormData({ ...formData, medium: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                  placeholder="Oil & 24K Gold Leaf on Linen Canvas"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gallery-dark">Width (inches) *</label>
                  <input
                    type="number"
                    required
                    value={formData.width}
                    onChange={e => setFormData({ ...formData, width: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gallery-dark">Height (inches) *</label>
                  <input
                    type="number"
                    required
                    value={formData.height}
                    onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                  />
                </div>
              </div>

              {/* DYNAMIC MULTI-PHOTO & DRAG-AND-DROP UPLOAD SECTION */}
              <div className="space-y-3 pt-3 border-t border-gallery-border/80">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-gallery-dark uppercase tracking-wider">
                      Painting Photos & Uploads ({imageRows.filter(r => r.url.trim().length > 0).length})
                    </label>
                    <p className="text-[11px] text-gallery-muted">
                      Drop images directly below, paste with <kbd className="px-1 py-0.5 bg-gallery-card border rounded text-[10px]">Ctrl+V</kbd>, or add manual URLs.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addImageRow}
                    className="px-2.5 py-1.5 bg-gallery-gold/10 hover:bg-gallery-gold/20 text-gallery-gold-dark border border-gallery-gold/30 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo Row</span>
                  </button>
                </div>

                {/* INTERACTIVE DRAG & DROP UPLOAD ZONE */}
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDraggingOverMain(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDraggingOverMain(false);
                  }}
                  onDrop={handleMainDrop}
                  className={`relative block p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                    isDraggingOverMain
                      ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01] shadow-lg ring-2 ring-emerald-400/30'
                      : 'border-gallery-gold/40 hover:border-gallery-gold bg-gallery-card/40 hover:bg-gallery-card/70'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMainFileSelect}
                    className="hidden"
                  />

                  {isUploadingImages ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-2">
                      <Loader2 className="w-8 h-8 text-gallery-gold animate-spin" />
                      <span className="text-xs font-medium text-gallery-dark">
                        {uploadProgress
                          ? `Uploading ${uploadProgress.completed} of ${uploadProgress.total} image(s)...`
                          : 'Uploading photo to artwork storage...'}
                      </span>
                      {uploadProgress && uploadProgress.total > 0 && (
                        <div className="w-48 bg-gallery-border h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                            style={{
                              width: `${(uploadProgress.completed / uploadProgress.total) * 100}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-1">
                      <div className="w-10 h-10 rounded-full bg-gallery-gold/10 text-gallery-gold flex items-center justify-center mx-auto mb-2 border border-gallery-gold/20">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-gallery-dark">
                        {isDraggingOverMain ? (
                          <span className="text-emerald-700 font-bold">Release to drop & upload image files</span>
                        ) : (
                          <span>
                            <span className="text-gallery-gold font-bold underline">Click to upload</span> or drag and drop images here
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-gallery-muted">
                        Supports multiple files (JPG, PNG, WebP, AVIF) • Automatically assigns cover & detail angles
                      </p>
                    </div>
                  )}
                </label>

                {/* PHOTO ROWS LIST */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {imageRows.map((row, index) => {
                    const isDragTarget = dragOverRowIndex === index;
                    return (
                      <div
                        key={index}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverRowIndex(index);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverRowIndex(null);
                        }}
                        onDrop={(e) => handleRowFileDrop(e, index)}
                        className={`flex flex-col sm:flex-row sm:items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                          isDragTarget
                            ? 'bg-emerald-50 border-emerald-500 shadow-md scale-[1.01]'
                            : 'bg-white border-gallery-border shadow-xs hover:border-gallery-border/80'
                        }`}
                      >
                        {/* Thumbnail & Quick Replace */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Order Badges & Move Controls */}
                          <div className="flex flex-col items-center justify-center text-gallery-muted">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveImageRow(index, 'up')}
                              className="p-0.5 hover:text-gallery-dark disabled:opacity-20 transition-colors"
                              title="Move photo up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-mono font-bold text-gallery-muted/70 leading-none">
                              #{index + 1}
                            </span>
                            <button
                              type="button"
                              disabled={index === imageRows.length - 1}
                              onClick={() => moveImageRow(index, 'down')}
                              className="p-0.5 hover:text-gallery-dark disabled:opacity-20 transition-colors"
                              title="Move photo down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Image Thumbnail with Drag / Replace File Overlay */}
                          <label className="relative w-12 h-12 rounded border border-gallery-border bg-gallery-card overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleRowFileSelect(e, index)}
                              className="hidden"
                            />
                            {row.url ? (
                              <img
                                src={row.url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-gallery-muted/50 group-hover:text-gallery-gold" />
                            )}
                            <div className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[9px] font-semibold text-center p-0.5">
                              Replace
                            </div>
                          </label>
                        </div>

                        {/* Image URL Input & Status */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              required={index === 0}
                              value={row.url}
                              onChange={e => updateImageRow(index, 'url', e.target.value)}
                              className="w-full px-2.5 py-1 bg-gallery-bg border border-gallery-border rounded text-xs text-gallery-dark font-mono focus:outline-none focus:border-gallery-gold"
                              placeholder={index === 0 ? 'Image URL or drop file here...' : 'Angled/detail image URL...'}
                            />
                          </div>
                          {row.url && row.url.startsWith('data:image') && (
                            <span className="text-[10px] text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Uploaded local image file
                            </span>
                          )}
                          {row.url && row.url.includes('supabase') && (
                            <span className="text-[10px] text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Hosted on Supabase Storage
                            </span>
                          )}
                        </div>

                        {/* Photo View Type Selector */}
                        <select
                          value={row.type}
                          onChange={e => updateImageRow(index, 'type', e.target.value)}
                          className="px-2.5 py-1.5 bg-gallery-bg border border-gallery-border rounded text-xs text-gallery-dark focus:outline-none font-medium shrink-0"
                        >
                          <option value="primary">Primary (Cover Front)</option>
                          <option value="angled">Angled View</option>
                          <option value="detail">Close-up Detail</option>
                          <option value="room">In-Room Setting</option>
                          <option value="back">Back Signature</option>
                        </select>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Direct Replace button */}
                          <label
                            className="p-1.5 text-gallery-muted hover:text-gallery-gold hover:bg-gallery-gold/10 rounded transition-colors cursor-pointer"
                            title="Choose image file from computer"
                          >
                            <Upload className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleRowFileSelect(e, index)}
                              className="hidden"
                            />
                          </label>

                          {/* Launch ChatGPT for this specific photo */}
                          {row.url && (
                            <button
                              type="button"
                              onClick={() => handleLaunchChatGPTModalForm(row.url)}
                              className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors"
                              title="Launch ChatGPT conversation for this specific image"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Row Button */}
                          <button
                            type="button"
                            onClick={() => removeImageRow(index)}
                            className="p-1.5 text-gallery-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title={imageRows.length > 1 ? 'Remove Photo Row' : 'Clear Photo'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DESCRIPTION & ARTWORK STORY */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gallery-dark">Artwork Story & Description</label>
                  <button
                    type="button"
                    onClick={() => handleLaunchChatGPTModalForm()}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Generate via ChatGPT</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-xs focus:outline-none focus:border-gallery-gold"
                  placeholder="Enter artwork story, texture details, or paste generated ChatGPT narrative..."
                />
              </div>

              {/* CHATGPT CONVERSATION LAUNCH CARD */}
              <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-xl border border-emerald-700/50 shadow-md space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-emerald-100">ChatGPT Conversation Assistant</h4>
                      <p className="text-[11px] text-emerald-300/80">
                        Carries artwork prompt & image URLs directly to your ChatGPT conversation window.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowChatGptSettings(!showChatGptSettings)}
                    className="p-1.5 text-emerald-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Configure ChatGPT Conversation URL"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {/* ChatGPT Settings Drawer (if toggled) */}
                {showChatGptSettings && (
                  <div className="p-3 bg-black/40 rounded-lg border border-emerald-600/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <label className="font-medium text-emerald-200 text-[11px]">ChatGPT Conversation URL:</label>
                      <button
                        type="button"
                        onClick={() => handleUpdateChatGptUrl(DEFAULT_CHATGPT_CONVERSATION_URL)}
                        className="text-[10px] text-emerald-400 hover:underline"
                      >
                        Reset to Default
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={chatGptUrl}
                        onChange={e => handleUpdateChatGptUrl(e.target.value)}
                        className="flex-1 px-2.5 py-1 bg-slate-950 border border-emerald-500/40 rounded text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                        placeholder="https://chatgpt.com/c/..."
                      />
                    </div>
                    <p className="text-[10px] text-emerald-400/80">
                      Target Link: <span className="underline truncate inline-block max-w-[280px] align-bottom">{chatGptUrl}</span>
                    </p>
                  </div>
                )}

                {/* Launch Button & Copy Helpers */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-emerald-800/60">
                  <div className="text-[11px] text-emerald-200/90 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyImageOnly()}
                      className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/50 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Copy Image File Blob to system clipboard"
                    >
                      <Copy className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copy Image File</span>
                    </button>
                    <span className="text-emerald-500/60">•</span>
                    <span>Press <kbd className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-700 rounded text-[10px] text-emerald-200 font-mono">Ctrl+V</kbd> in ChatGPT to paste photo</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLaunchChatGPTModalForm()}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs uppercase font-bold tracking-wider flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Launch ChatGPT Conversation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-gallery-border text-gallery-gold focus:ring-gallery-gold"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gallery-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gallery-border rounded text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gallery-dark text-white rounded text-xs uppercase font-semibold hover:bg-gallery-gold disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? 'Saving to Supabase...' : 'Save Artwork'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY & SUBCATEGORY MANAGEMENT MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gallery-bg border border-gallery-border rounded-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gallery-border pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-gallery-gold" />
                <h3 className="font-serif text-xl font-medium text-gallery-dark">Manage Categories & Subcategories</h3>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-xs text-gallery-muted hover:text-gallery-dark uppercase font-semibold"
              >
                Close
              </button>
            </div>

            {/* Create Category Form */}
            <form onSubmit={handleSaveCategory} className="bg-white p-4 rounded-lg border border-gallery-border space-y-3 shadow-xs">
              <h4 className="font-serif text-sm font-semibold text-gallery-dark">Create New Category or Subcategory</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gallery-dark">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={catFormData.name}
                    onChange={e => setCatFormData({ ...catFormData, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gallery-bg border border-gallery-border rounded text-xs focus:outline-none focus:border-gallery-gold"
                    placeholder="e.g. 24K Gold Leaf Miniatures"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gallery-dark">Parent Category (Optional)</label>
                  <select
                    value={catFormData.parentId}
                    onChange={e => setCatFormData({ ...catFormData, parentId: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gallery-bg border border-gallery-border rounded text-xs focus:outline-none focus:border-gallery-gold"
                  >
                    <option value="">-- None (Top-Level Category) --</option>
                    {mainCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} (Subcategory of this)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gallery-dark">Description</label>
                <input
                  type="text"
                  value={catFormData.description}
                  onChange={e => setCatFormData({ ...catFormData, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-gallery-bg border border-gallery-border rounded text-xs focus:outline-none focus:border-gallery-gold"
                  placeholder="Short description of this art category..."
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-4 py-1.5 bg-gallery-dark text-white rounded text-xs uppercase font-semibold hover:bg-gallery-gold disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{savingCategory ? 'Creating...' : 'Create Category'}</span>
                </button>
              </div>
            </form>

            {/* List Existing Categories & Subcategories */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-semibold text-gallery-dark">Existing Category Hierarchy</h4>

              <div className="space-y-3">
                {mainCategories.map(mainCat => {
                  const subs = allCategories.filter(c => c.parentId === mainCat.id);
                  return (
                    <div key={mainCat.id} className="bg-white border border-gallery-border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-serif text-sm font-semibold text-gallery-dark block">
                            {mainCat.name}
                          </span>
                          {mainCat.description && (
                            <span className="text-[11px] text-gallery-muted">{mainCat.description}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(mainCat.id)}
                          className="p-1 text-gallery-muted hover:text-red-600 transition-colors text-xs"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {subs.length > 0 && (
                        <div className="pl-4 pt-1 border-l-2 border-gallery-gold/40 space-y-1.5">
                          {subs.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between bg-gallery-card/60 p-2 rounded border border-gallery-border/60 text-xs">
                              <div>
                                <span className="font-medium text-gallery-dark">↳ {sub.name}</span>
                                {sub.description && (
                                  <span className="text-[10px] text-gallery-muted block">{sub.description}</span>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteCategory(sub.id)}
                                className="p-1 text-gallery-muted hover:text-red-600 transition-colors"
                                title="Delete Subcategory"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
