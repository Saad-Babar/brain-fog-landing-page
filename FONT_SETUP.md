# Jameel Noori Nastaleeq Font Setup

## 📁 Font Installation Steps

### 1. Download the Font
Download the Jameel Noori Nastaleeq font file from a reliable source:
- **Font Name**: Jameel Noori Nastaleeq
- **File Format**: TTF (TrueType Font)
- **File Size**: ~2-3 MB

### 2. Place Font File
Place the downloaded font file in the following directory:
```
public/fonts/Jameel-Noori-Nastaleeq.ttf
```

### 3. Font Features
- **Script**: Urdu/Arabic Nastaliq style
- **Weight**: Regular (400)
- **Style**: Cursive/Handwriting style
- **Direction**: Right-to-Left (RTL)

### 4. CSS Classes Available
The following CSS classes are now available for Urdu text:

```css
.urdu-font {
  font-family: "Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", "Alvi Nastaleeq", serif;
}

.urdu-text {
  font-family: "Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", "Alvi Nastaleeq", serif;
  font-size: 1.2em;
  line-height: 1.8;
  direction: rtl;
  text-align: right;
}

.urdu-heading {
  font-family: "Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", "Alvi Nastaleeq", serif;
  font-size: 1.4em;
  line-height: 1.6;
  direction: rtl;
  text-align: right;
}
```

### 5. Usage in Components
Add the appropriate class to your Urdu text elements:

```jsx
// For headings
<h1 className="urdu-heading">ذہنی حالت کا ٹیسٹ</h1>

// For body text
<p className="urdu-text">براہ کرم یہ جملہ دہرائیں</p>

// For general Urdu content
<div className="urdu-font">اردو متن</div>
```

### 6. Fallback Fonts
If Jameel Noori Nastaleeq is not available, the system will fall back to:
1. Noto Nastaliq Urdu (Google Fonts)
2. Alvi Nastaleeq (System font)
3. Default serif font

### 7. Browser Support
- ✅ Chrome/Edge (WebKit)
- ✅ Firefox (Gecko)
- ✅ Safari (WebKit)
- ⚠️ Internet Explorer (Limited support)

### 8. Performance Notes
- Font file is ~2-3 MB
- Uses `font-display: swap` for better loading
- Consider font preloading for critical pages

## 🎯 Benefits
- **Authentic Nastaliq Style**: Proper Urdu calligraphy
- **Better Readability**: Optimized for elderly users
- **Cultural Authenticity**: Traditional Urdu typography
- **Responsive Design**: Works on all screen sizes

## 🔧 Troubleshooting
If the font doesn't load:
1. Check file path: `public/fonts/Jameel-Noori-Nastaleeq.ttf`
2. Verify file name spelling
3. Clear browser cache
4. Check browser console for errors 