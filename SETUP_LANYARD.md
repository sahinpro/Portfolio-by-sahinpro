# Lanyard Component Setup

## Installation Steps

### 1. Install Required Dependencies

Run the following command to install the required packages:

```bash
npm install @react-three/fiber@^8.15.0 @react-three/drei@^9.88.0 @react-three/rapier@^1.2.0 meshline three @types/three --legacy-peer-deps
```

Or if you prefer to use the latest versions (requires React 19):

```bash
npm install @react-three/fiber @react-three/drei @react-three/rapier meshline three @types/three
```

### 2. Download Required Assets

You **MUST** download these two files and place them in `src/components/Lanyard/`:

1. **card.glb** - 3D model of the ID card
2. **lanyard.png** - Texture for the lanyard band

**Download from:**
- React Bits repository: https://github.com/reactbits-dev/components
- Assets location in repo: `src/assets/lanyard/`
- Or visit: https://reactbits.dev/components/lanyard

**File structure should be:**
```
src/components/Lanyard/
  ├── card.glb          ← Download this
  ├── lanyard.png       ← Download this
  ├── lanyard.tsx       ← Already created
  ├── index.ts          ← Already created
  └── README.md         ← Already created
```

### 3. Customize Your Card (Optional)

1. **Edit card.glb:**
   - Use https://modelviewer.dev/editor/
   - Upload your card.glb file
   - Customize the texture and appearance
   - Export and replace the file

2. **Edit lanyard.png:**
   - Use any image editor (Photoshop, GIMP, etc.)
   - Customize the band texture
   - The texture will repeat along the lanyard band

### 4. Configuration (Already Done)

The following configurations have already been set up:

✅ **vite.config.ts** - Added `assetsInclude: ['**/*.glb']`
✅ **src/vite-env.d.ts** - Added type declarations for .glb and .png
✅ **src/global.d.ts** - Added meshline and JSX type declarations
✅ **Component code** - Lanyard component created with exact code from reactbits.dev

### 5. Usage

The component is already integrated into your HeroSection. You can adjust the props:

```tsx
<Lanyard 
  position={[0, 0, 20]}  // Camera position [x, y, z]
  gravity={[0, -40, 0]}  // Physics gravity [x, y, z]
  fov={20}               // Camera field of view
  transparent={true}     // Transparent background
/>
```

## Troubleshooting

### If you see import errors:
- Make sure the `card.glb` and `lanyard.png` files are in `src/components/Lanyard/`
- Check that the file names match exactly (case-sensitive)

### If you see type errors:
- Ensure `src/vite-env.d.ts` and `src/global.d.ts` are in place
- Restart your TypeScript server

### If the component doesn't render:
- Check browser console for errors
- Verify all dependencies are installed
- Make sure the .glb file is valid

## Notes

- The component is interactive - you can drag the card around
- It uses physics simulation for realistic movement
- The component is responsive and adjusts for mobile devices
- The lanyard band texture repeats along its length
