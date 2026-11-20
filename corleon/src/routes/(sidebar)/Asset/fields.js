// Metabox fields grouped for display, shared by the view and edit pages.
// type: 'text' (default) | 'date' | 'select' | 'textarea'; readonly fields are filled by WordPress.

export const resourceOptions = [
  { value: 'photo', name: 'Photo' },
  { value: 'video', name: 'Video' },
  { value: 'document', name: 'Document' },
  { value: 'audio', name: 'Audio' }
];

export const statusOptions = [
  { value: 'active', name: 'Active' },
  { value: 'none active', name: 'None Active' }
];

export const licenseOptions = [
  { value: 'public_domain', name: 'Public Domain' },
  { value: 'cc_by', name: 'Creative Common (CC-BY)' },
  { value: 'copyrighted', name: 'Copyrighted (All Rights Reserved)' }
];

export const fieldGroups = [
  {
    name: 'General',
    fields: [
      { key: 'resource_type', label: 'Resource Type', type: 'select', items: resourceOptions, placeholder: 'Choose Resource Type' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', items: statusOptions },
      { key: 'asset_license', label: 'Asset License', type: 'select', items: licenseOptions, placeholder: 'Choose License' },
      { key: 'location', label: 'Location' },
      { key: 'source', label: 'Source' },
      { key: 'credit', label: 'Credit' },
      { key: 'note', label: 'Notes' }
    ]
  },
  {
    name: 'People & Keywords',
    fields: [
      { key: 'photographer', label: 'Photographer' },
      { key: 'editor', label: 'Editor' },
      { key: 'screen', label: 'Screen' },
      { key: 'named_person', label: 'Named person(s)' },
      { key: 'recognised', label: 'Keywords - Recognised' },
      { key: 'landmark', label: 'Keywords - Landmark' },
      { key: 'keyword_other', label: 'Keyword - Other' }
    ]
  },
  {
    name: 'Media',
    fields: [
      { key: 'duration', label: 'Duration' },
      { key: 'sample', label: 'Sample rate' },
      { key: 'audio_bitrate', label: 'Audio bitrate' },
      { key: 'frame_rate', label: 'Frame rate' },
      { key: 'video_bitrate', label: 'Video bitrate' },
      { key: 'image_dimensions', label: 'Image Dimensions', readonly: true }
    ]
  },
  {
    name: 'File',
    fields: [
      { key: 'file_size', label: 'File Size' },
      { key: 'original_filename', label: 'Original File name', readonly: true },
      { key: 'file_hash', label: 'File Hash', readonly: true },
      { key: 'mime_type', label: 'Mime Type', readonly: true }
    ]
  },
  {
    name: 'Text',
    fields: [
      { key: 'caption', label: 'Caption', type: 'textarea' },
      { key: 'document_extract', label: 'Document extract', type: 'textarea', readonly: true }
    ]
  }
];
