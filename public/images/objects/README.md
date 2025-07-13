# Custom Object Images for MMSE Assessment

This directory is for storing custom object images used in the MMSE (Mini-Mental State Exam) object recognition test.

## How to Add Custom Images

1. **Image Requirements:**
   - Format: JPG or PNG
   - Size: 300x300 pixels (or square aspect ratio)
   - Background: White or clean background
   - Quality: High resolution, clear object

2. **Naming Convention:**
   - Use the object name as the filename
   - Example: `roti.jpg`, `chai.jpg`, `dahi.jpg`

3. **Supported Objects:**
   - **Food & Drinks**: roti, chai, dahi, sabzi, daal
   - **Household**: tashtari, katori, chamcha, chaku, glass
   - **Clothing**: shalwar, kameez, dupatta, topi, jooti
   - **Common Objects**: chabi, qalam, kitaab, ghari, phone
   - **Transport & Buildings**: gaari, bicycle, makaan, darwaza, khidki
   - **Nature**: phool, darakht, paani, doodh, seb

4. **Adding Images:**
   - Place your custom images in this directory
   - Update the `imageUrl` in `src/components/ObjectRecognition.tsx` to use local paths
   - Example: Change from `https://images.unsplash.com/...` to `/images/objects/roti.jpg`

5. **Image Sources:**
   - Take photos of actual objects
   - Use stock photos with clean backgrounds
   - Ensure objects are culturally relevant to Pakistan

## Current Setup

The system currently uses Unsplash placeholder images. To use custom images:

1. Add your images to this directory
2. Update the `imageUrl` paths in the component
3. Test the images load correctly

## Benefits of Custom Images

- **Cultural Relevance**: Objects familiar to Pakistani users
- **Consistency**: Same images across all assessments
- **Quality Control**: Ensure clean, appropriate backgrounds
- **Local Context**: Objects that users encounter daily

## Example Image Updates

```typescript
// In src/components/ObjectRecognition.tsx
{ 
  name: "roti", 
  urduName: "روٹی",
  imageUrl: "/images/objects/roti.jpg", // Custom image path
  category: "food",
  correctAnswers: ["roti", "روٹی", "chapati", "چپاتی", "bread"]
}
```

## Tips for Good Images

- Use natural lighting
- Keep background simple (white or light)
- Ensure object is clearly visible
- Avoid shadows or reflections
- Use consistent style across all images 