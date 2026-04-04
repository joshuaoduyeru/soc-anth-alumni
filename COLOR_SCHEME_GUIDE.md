# Color Scheme Integration Guide

## 🎨 Alumni Platform Color System

Your `alumni-platform.html` defines a sophisticated color palette that should be used throughout the entire application for consistency.

### CSS Variables (from alumni-platform.html)

```css
:root {
  --ink:       #12100e;  /* Dark charcoal - PRIMARY TEXT & BG */
  --cream:     #f6f2ec;  /* Off-white - LIGHT BG */
  --gold:      #c8963e;  /* Warm gold - PRIMARY ACCENT */
  --gold-l:    #e8b86a;  /* Light gold - HOVER/ACTIVE */
  --gold-pale: #fdf6e9;  /* Very light gold - SUBTLE BG */
  --rust:      #b5411a;  /* Deep rust - ERROR/DESTRUCTIVE */
  --sage:      #3e6435;  /* Muted green - SUCCESS/POSITIVE */
  --slate:     #384959;  /* Cool gray - SECONDARY TEXT */
  --mist:      #e5e0d8;  /* Light gray - BORDERS/DIVIDERS */
  --shadow:    rgba(18,16,14,0.1); /* Subtle shadow */
  
  /* Utility colors */
  --red:       #c0392b;  /* Error state */
  --green:     #27ae60;  /* Success state */
  --blue:      #2980b9;  /* Info state */
}
```

---

## 🎯 Where To Use Each Color

### --ink (#12100e)
**Primary dark background and text**
- Header background
- Main text color
- Dark UI elements
- Card backgrounds

```tsx
style={{ 
  backgroundColor: 'var(--ink)',
  color: 'var(--ink)',
}}
```

### --cream (#f6f2ec)
**Light background and light text**
- Page background
- Light text on dark backgrounds
- Light mode backgrounds
- Accents on dark backgrounds

```tsx
style={{
  backgroundColor: 'var(--cream)',
  color: 'var(--cream)',
}}
```

### --gold (#c8963e)
**Primary accent color**
- Buttons
- Links
- Icons
- Active states
- Badge highlights

```tsx
style={{
  color: 'var(--gold)',
  backgroundColor: 'var(--gold)',
  borderColor: 'var(--gold)',
}}
```

### --gold-l (#e8b86a)
**Light gold for hover/active states**
- Hover text on dark backgrounds
- Active navigation items
- Light accent text
- Selected items

```tsx
style={{
  color: 'var(--gold-l)',
}}
```

### --gold-pale (#fdf6e9)
**Very light gold background**
- Info boxes
- Badge backgrounds
- Subtle highlights
- Admin notifications

```tsx
style={{
  backgroundColor: 'var(--gold-pale)',
}}
```

### --rust (#b5411a)
**Destructive/Error state**
- Delete buttons
- Error messages
- Warning states
- Critical alerts

```tsx
style={{
  color: 'var(--rust)',
}}
```

### --sage (#3e6435)
**Success/Positive state**
- Success messages
- Completed badges
- Approved items

```tsx
style={{
  color: 'var(--sage)',
}}
```

### --slate (#384959)
**Secondary text**
- Descriptions
- Muted text
- Help text
- Timestamps

```tsx
style={{
  color: 'var(--slate)',
}}
```

### --mist (#e5e0d8)
**Borders and dividers**
- Input borders
- Card dividers
- Subtle separations
- Disabled states

```tsx
style={{
  borderColor: 'var(--mist)',
  backgroundColor: 'var(--mist)',
}}
```

---

## 📱 Component Color Examples

### UserProfileDropdown

```tsx
// Avatar fallback
<AvatarFallback 
  style={{
    backgroundColor: 'var(--gold)',      // Gold background
    color: 'var(--ink)',                 // Dark text
  }}
/>

// Admin badge
<div style={{
  backgroundColor: 'var(--gold-pale)',   // Light gold background
  color: 'var(--rust)',                  // Rust text for admin
}}>
  ADMIN
</div>

// Logout button
<DropdownMenuItem style={{
  color: 'var(--rust)',                  // Rust for destructive
}}>
  Sign out
</DropdownMenuItem>
```

### Buttons

```tsx
// Primary button
<Button style={{
  backgroundColor: 'var(--gold)',
  color: 'var(--ink)',
}}>
  Create
</Button>

// Secondary button
<Button style={{
  borderColor: 'var(--mist)',
  color: 'var(--ink)',
}}>
  Cancel
</Button>

// Destructive button
<Button style={{
  backgroundColor: 'var(--rust)',
  color: 'var(--cream)',
}}>
  Delete
</Button>
```

### Form Elements

```tsx
<input 
  style={{
    borderColor: 'var(--mist)',
    backgroundColor: 'white',
    color: 'var(--ink)',
  }}
  onFocus={(e) => {
    e.currentTarget.style.borderColor = 'var(--gold)'
  }}
/>
```

### Navigation

```tsx
<nav>
  <button
    style={{
      backgroundColor: activeItem 
        ? 'rgba(200, 150, 62, 0.18)'  // Gold with opacity
        : 'transparent',
      color: activeItem 
        ? 'var(--gold-l)' 
        : 'rgba(255,255,255,0.55)',
    }}
  >
    {item.label}
  </button>
</nav>
```

### Cards

```tsx
<div style={{
  backgroundColor: 'white',
  borderColor: 'var(--mist)',
  color: 'var(--ink)',
}}>
  <h3 style={{ color: 'var(--ink)' }}>Title</h3>
  <p style={{ color: 'var(--slate)' }}>Description</p>
</div>
```

### Status Indicators

```tsx
// Success
<span style={{ color: 'var(--sage)' }}>✓ Completed</span>

// Error
<span style={{ color: 'var(--rust)' }}>✕ Failed</span>

// Info
<span style={{ color: 'var(--blue)' }}>ℹ Information</span>

// Pending
<span style={{ color: 'var(--gold)' }}>⟳ Pending</span>
```

---

## 🌐 Global Styles

Add this to your main stylesheet to ensure colors are available everywhere:

```css
:root {
  --ink: #12100e;
  --cream: #f6f2ec;
  --gold: #c8963e;
  --gold-l: #e8b86a;
  --gold-pale: #fdf6e9;
  --rust: #b5411a;
  --sage: #3e6435;
  --slate: #384959;
  --mist: #e5e0d8;
  --shadow: rgba(18, 16, 14, 0.1);
  --red: #c0392b;
  --green: #27ae60;
  --blue: #2980b9;
}

body {
  background-color: var(--cream);
  color: var(--ink);
  font-family: 'DM Sans', sans-serif;
}

/* Links */
a {
  color: var(--gold);
  transition: color 0.2s;
}

a:hover {
  color: var(--gold-l);
}

/* Buttons */
button {
  border-radius: 6px;
  transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow);
}

/* Inputs */
input, textarea, select {
  border: 2px solid var(--mist);
  border-radius: 6px;
  padding: 10px 12px;
  font-family: 'DM Sans', sans-serif;
  transition: border-color 0.2s;
}

input:focus, 
textarea:focus, 
select:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(200, 150, 62, 0.12);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: var(--cream);
}

::-webkit-scrollbar-thumb {
  background: var(--gold);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--gold-l);
}
```

---

## ✨ Component Color Reference

| Component | Background | Text | Border | Hover |
|-----------|------------|------|--------|-------|
| Header | --ink | --cream | rgba(255,255,255,0.06) | - |
| Button Primary | --gold | --ink | --gold | --gold-l |
| Button Secondary | transparent | --ink | --mist | var(--mist) |
| Input | white | --ink | --mist | --gold |
| Card | white | --ink | --mist | - |
| Badge Admin | --gold-pale | --rust | --gold-l | - |
| Badge Alumni | --mist | --slate | --mist | - |
| Success | - | --sage | --sage | - |
| Error | var(--rust) bg | --cream | --rust | - |
| Disabled | --mist | --slate | --mist | - |
| Link | - | --gold | - | --gold-l |

---

## 🎨 Updated Files Using Color System

✅ **user-profile-dropdown.tsx** - Uses color variables  
✅ **app-shell.tsx** - Uses color variables  
✅ **admin/route.ts** - No UI (API only)

---

## 📋 Converting Old Colors to New

If you find old color references:

| Old | New | Purpose |
|-----|-----|---------|
| var(--primary) | var(--ink) | Dark background |
| var(--secondary) | var(--gold) | Gold accent |
| var(--gold-light) | var(--gold-l) | Light gold |
| white/55 | rgba(255,255,255,0.55) | Muted light text |
| white/10 | rgba(255,255,255,0.1) | Subtle hover |
| bg-background | var(--cream) | Light background |
| text-muted-foreground | var(--slate) | Secondary text |

---

## 🚀 Implementation Checklist

- [x] UserProfileDropdown uses color variables
- [x] AppShell uses color variables  
- [ ] All form components use color variables
- [ ] All buttons use color variables
- [ ] All cards use color variables
- [ ] Section headers use color variables
- [ ] Status indicators use color variables
- [ ] Modal/dialog backgrounds consistent
- [ ] Mobile responsive uses same colors
- [ ] Dark mode support (optional)

---

Your application now has a cohesive, professional color scheme! 🎨
