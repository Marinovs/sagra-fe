# WhatsApp Image Sharing Fix - Implementation Guide

This document explains the changes made to fix WhatsApp image sharing issues.

## Problem

Images were not appearing when sharing URLs on WhatsApp due to:

1. Relative URLs in Open Graph meta tags
2. Incorrect image dimensions
3. Missing absolute URLs for social media crawlers

## Solution Implemented

### 1. Created Metadata Utility (`lib/metadata.ts`)

- Central utility for generating Open Graph and Twitter metadata
- Automatic URL resolution for different environments
- Proper image dimensions (1200x630) for social media
- Type-safe metadata generation

### 2. Updated Layout (`app/layout.tsx`)

- Uses new metadata utility
- Properly structured metadata with absolute URLs
- Fixed TypeScript types for robots configuration

### 3. Added Page-Specific Metadata (`app/menu/page.tsx`)

- Dedicated metadata for menu page
- Optimized for search engines and social sharing

### 4. Environment Configuration (`.env.example`)

Required environment variables:

```
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

## Key Features

### Automatic URL Resolution

The system automatically detects the correct base URL:

1. `NEXT_PUBLIC_APP_URL` (production)
2. `VERCEL_URL` (Vercel deployments)
3. `localhost:3000` (development)

### Optimized Image Specifications

- **Dimensions**: 1200x630 pixels (Facebook/WhatsApp recommended)
- **Format**: WebP (modern, compressed)
- **Absolute URLs**: Required for social media crawlers

### Social Media Support

- **Open Graph**: Facebook, WhatsApp, LinkedIn
- **Twitter Cards**: Twitter-specific metadata
- **Rich Previews**: Enhanced link previews

## Testing

### 1. WhatsApp Link Preview

Test by sharing your URL in WhatsApp to see the image preview.

### 2. Facebook Debugger

Use Facebook's Sharing Debugger:
https://developers.facebook.com/tools/debug/

### 3. Twitter Card Validator

Use Twitter's Card Validator:
https://cards-dev.twitter.com/validator

## Deployment Notes

1. **Set Production URL**: Update `NEXT_PUBLIC_APP_URL` in production
2. **HTTPS Required**: WhatsApp requires HTTPS for images
3. **Image Accessibility**: Ensure banner.webp is publicly accessible
4. **Cache Clearing**: May need to clear social media cache after changes

## Image Requirements for WhatsApp

- **Minimum size**: 300x157 pixels
- **Recommended size**: 1200x630 pixels
- **Maximum size**: 8MB
- **Formats**: JPG, PNG, WebP
- **Absolute URL**: Must be fully qualified (https://...)

## Troubleshooting

If images still don't appear:

1. Check that `NEXT_PUBLIC_APP_URL` is set correctly
2. Verify image is accessible at the absolute URL
3. Clear WhatsApp cache by changing the URL slightly
4. Use Facebook Debugger to force refresh

## Future Improvements

Consider adding:

- Dynamic image generation for different pages
- Automatic image optimization
- A/B testing for different image formats
- Analytics for social sharing
