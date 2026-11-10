# Three.js Fantasy Board Game — Anime Character System, Selection & Customization

## 1. Mission

Design and implement a premium 3D anime fantasy character system for the existing Three.js board game.

Characters should look like high-quality collectible anime RPG heroes, with attractive faces, expressive personalities, beautifully designed costumes, detailed hair, and distinctive fantasy aesthetics.

The character roster should feature primarily beautiful, sexy, adult female characters, complemented by a smaller selection of attractive male characters.

The goal is to make character selection an exciting part of the gaming experience, with impressive 3D previews, idle animations, customization options, and visually distinctive character pawns on the board.

**IMPORTANT: Preserve all existing gameplay rules, application UI, board mechanics, player state, and camera controls.**

Build the character system as an extension of the existing application, not as a separate application.

## 2. Character Art Direction

### Core Visual Style

Target a polished, modern anime fantasy RPG aesthetic.

Visual characteristics:

- Beautiful stylized anime faces.
- Large expressive eyes.
- Refined facial proportions.
- Detailed hairstyles with flowing strands.
- Elegant fantasy costumes.
- Attractive character silhouettes.
- Rich material colors.
- High-quality stylized skin shading.
- Delicate decorative accessories.
- Dramatic yet tasteful character poses.
- Visually distinctive personalities.

The female designs should generally be glamorous, alluring, and confidently sensual, with adult proportions and expressive body language.

Avoid generic characters, childish proportions, awkward anatomy, and overly simplified low-poly avatars.

All playable characters must be clearly adult, aged 21 or older.

### Character Proportions

Use consistent stylized anime proportions.

- Expressive faces and slightly enlarged eyes.
- Elegantly proportioned bodies.
- Well-defined silhouettes.
- Natural-looking hands and fingers.
- Refined clothing geometry.
- Beautifully styled hair.
- Distinctive character heights and builds.

The characters should look excellent both as full-screen 3D previews and as miniature pawns viewed from above.

## 3. Initial Character Roster

Create an initial roster of 12 characters:

- 9 adult female characters.
- 3 adult male characters.

Each character must have a unique design, personality, outfit, color palette, idle animation, and themed circular pawn base.

### Female Characters

**1. Lyra — The Violet Enchantress**

- Adult woman, 25 years old.
- Long flowing dark-purple hair.
- Violet eyes.
- Elegant black-and-purple fantasy dress.
- Stylish fitted bodice, lace details, and high boots.
- Large decorated witch hat.
- Glowing magical staff.
- Confident, playful smile.
- Mysterious and seductive personality.
- Purple magical particle effects.

**2. Seraphine — The Moonlight Knight**

- Adult woman, 27 years old.
- Long silver-white hair.
- Blue eyes.
- Elegant white-and-silver armor with blue and gold accents.
- Beautifully designed armored bodice, flowing cape, and tall boots.
- Refined sword.
- Confident, noble stance.
- Soft blue magical glow.

**3. Rhea — The Scarlet Rogue**

- Adult woman, 24 years old.
- Long red hair.
- Amber eyes.
- Stylish black-and-red leather fantasy outfit.
- Fitted jacket, decorative belts, gloves, and high boots.
- Twin daggers.
- Playful, daring expression.
- Athletic and agile silhouette.
- Red magical accents.

**4. Elowen — The Elven Priestess**

- Adult woman, 26 years old.
- Long platinum-blonde hair.
- Emerald-green eyes.
- Pointed elven ears.
- Elegant green-and-white fantasy dress.
- Ornate gold accessories.
- Magical staff with a glowing crystal.
- Graceful posture.
- Gentle but confident personality.
- Soft green magical particles.

**5. Akari — The Kitsune Sorceress**

- Adult woman, 24 years old.
- Long black hair with red highlights.
- Golden eyes.
- Fox ears and flowing fox tails.
- Luxurious red-and-white fantasy kimono-inspired outfit.
- Gold ornaments and flowing sleeves.
- Elegant heeled footwear.
- Mischievous smile.
- Floating magical foxfire.

**6. Nyx — The Shadow Assassin**

- Adult woman, 28 years old.
- Short black hair with violet highlights.
- Sharp violet eyes.
- Dark fitted fantasy armor.
- Stylish hooded cloak.
- Decorative buckles and belts.
- Dual curved blades.
- Athletic figure.
- Cool, confident attitude.
- Shadowy purple particles.

**7. Aurelia — The Golden Valkyrie**

- Adult woman, 29 years old.
- Long golden-blonde hair.
- Blue eyes.
- Ornate white-and-gold armor.
- Elegant wing-inspired shoulder pieces.
- Flowing white cape.
- Decorative thigh-high armored boots.
- Golden spear.
- Commanding heroic pose.
- Radiant golden effects.

**8. Selene — The Frost Witch**

- Adult woman, 25 years old.
- Long pale-blue hair.
- Icy-blue eyes.
- Elegant navy-and-white fantasy dress.
- Silver jewelry and crystal accessories.
- Flowing translucent fabric details.
- Magical ice staff.
- Calm and mysterious expression.
- Floating snowflakes and frost particles.

**9. Vesper — The Crimson Demoness**

- Adult woman, 27 years old.
- Long dark-red hair.
- Red eyes.
- Elegant curved horns.
- Beautiful black-and-crimson fantasy outfit.
- Gold jewelry and decorative chains.
- Stylish high boots.
- Small dark wings.
- Confident, seductive smile.
- Scarlet magical flames.

### Male Characters

**10. Alaric — The Royal Paladin**

- Adult man, 29 years old.
- Blonde hair.
- Blue eyes.
- Attractive heroic appearance.
- Ornate blue-and-gold armor.
- Flowing cape.
- Large elegant sword.
- Noble posture.
- Golden magical effects.

**11. Kael — The Shadow Swordsman**

- Adult man, 27 years old.
- Black hair.
- Silver eyes.
- Stylish dark fantasy outfit.
- Long black coat.
- Decorative armor.
- Katana-inspired sword.
- Mysterious personality.
- Purple shadow effects.

**12. Orion — The Arcane Scholar**

- Adult man, 30 years old.
- Silver hair.
- Violet eyes.
- Elegant wizard coat.
- Decorative arcane accessories.
- Magical spellbook.
- Floating magical symbols.
- Intellectual and charismatic personality.
- Blue-purple arcane effects.

## 4. Character Selection Experience

Implement a dedicated character-selection interface that integrates with the existing application.

Do not redesign the main game UI.

The character-selection interface should appear as a modal, overlay, or dedicated selection screen.

### Character Gallery

Display all characters as selectable cards.

Each card should show:

- Character portrait.
- Character name.
- Class or archetype.
- Primary color.
- Small role icon.
- Selection state.

Use a responsive grid or carousel.

Clearly distinguish:

- Available characters.
- Selected character.
- Characters already selected by another player.
- Locked characters, if character unlocking is supported.

Avoid unnecessarily large cards.

### Interactive 3D Preview

When selecting a character, open a detailed 3D character preview.

The preview should feature:

- Full-body 3D character model.
- Slow automatic rotation.
- Orbit controls.
- Zoom.
- Character-specific idle animation.
- Subtle cinematic lighting.
- Appropriate fantasy background.
- Character-themed particle effects.
- Character name and archetype.

The user should be able to inspect the character from every angle.

### Preview Camera Modes

Support:

- Full body.
- Upper body.
- Face close-up.
- Equipment details.

Switch smoothly between camera positions.

Do not abruptly teleport the preview camera.

### Character Selection Animation

When a character is selected:

1. Highlight the character card.
2. Animate the preview camera toward the character.
3. Play the character's signature pose.
4. Trigger subtle magical particles.
5. Illuminate the character's circular base.
6. Confirm selection using the existing player-selection flow.

Keep the experience polished and responsive.

## 5. Character Presentation and Appeal

Character presentation should feel glamorous and premium.

### Female Characters

Emphasize:

- Beautiful facial features.
- Elegant silhouettes.
- Confident poses.
- Fashionable fantasy costumes.
- Long flowing hair where appropriate.
- Refined accessories.
- Attractive adult proportions.
- Expressive eyes.
- Tasteful sensuality.
- Distinctive personalities.

Different characters should express attractiveness differently.

For example:

- Lyra: mysterious and playful.
- Seraphine: noble and elegant.
- Rhea: daring and confident.
- Elowen: graceful and ethereal.
- Akari: mischievous and charismatic.
- Nyx: dangerous and sophisticated.
- Aurelia: powerful and regal.
- Selene: cool and mysterious.
- Vesper: seductive and commanding.

Avoid giving every female character the same face, body shape, or clothing silhouette.

### Male Characters

Create attractive male heroes with distinct appearances.

Use:

- Strong silhouettes.
- Detailed outfits.
- Expressive faces.
- Confident poses.
- Elegant hairstyles.
- Character-specific personalities.

They should match the same level of visual quality as the female roster.

## 6. Character Customization

Implement optional customization that does not affect gameplay balance.

### Outfit Variants

Support multiple outfits per character.

Suggested outfit categories:

- Default fantasy outfit.
- Royal elegance.
- Battle-ready armor.
- Enchanted ceremonial costume.
- Casual fantasy outfit.
- Seasonal event costume.

Outfit selection should preserve the character's distinctive identity.

### Color Customization

Allow recoloring supported outfit regions:

- Primary fabric.
- Secondary fabric.
- Metallic accents.
- Magical effects.
- Pawn base color.

Use material variants or shader parameters rather than duplicating entire models unnecessarily.

### Accessories

Potential accessories:

- Hats.
- Hair ornaments.
- Capes.
- Jewelry.
- Decorative armor.
- Gloves.
- Magical artifacts.
- Weapon variations.

Accessories should be attached to appropriate rig bones or predefined attachment points.

### Character Appearance

Where supported by assets, expose:

- Hair color.
- Eye color.
- Hairstyle variants.
- Outfit colors.
- Accessories.
- Magical aura color.

Do not promise morphable appearance features unless the underlying models support them.

## 7. Character Animation System

Every character should feel alive.

### Idle Animations

Examples:

- Natural breathing.
- Subtle body movement.
- Gentle head turns.
- Blinking.
- Hair swaying.
- Fabric movement.
- Weapon adjustments.
- Small magical gestures.

Idle animations should loop smoothly.

### Signature Animations

Each character should have one distinctive preview animation.

Examples:

- Mage summons a glowing orb.
- Knight raises a sword.
- Rogue twirls a dagger.
- Priestess creates a magical flower.
- Kitsune conjures foxfire.
- Assassin performs a graceful weapon flourish.
- Valkyrie summons golden wings.
- Frost Witch creates floating ice crystals.
- Demoness summons crimson flames.

### Board Movement

Pawns should support:

- Idle.
- Movement start.
- Walking or gliding between tiles.
- Jumping or stepping onto elevated tiles.
- Landing.
- Celebration.
- Reaction to special tiles.

Preserve existing game movement timing and logic.

Animation must not modify authoritative tile state.

## 8. Board Pawn Integration

Characters should appear as miniature anime fantasy figurines on the board.

Each pawn should have:

- A circular platform.
- Player-specific color.
- Subtle emissive border.
- A distinctive character model.
- A recognizable silhouette.
- A contact shadow.
- Optional themed particles.

### Pawn Scale

Scale pawns relative to board tiles.

A pawn should fit within its tile footprint and remain recognizable from the default isometric camera.

Do not use the same full-detail model settings for both preview and board rendering without evaluating performance.

### Selected Pawn

When the player's pawn is active:

- Increase its base illumination.
- Display an animated selection ring.
- Add subtle magical particles.
- Highlight the occupied tile.

Avoid visual effects that obscure nearby tile symbols.

### Multiple Pawns

When multiple characters occupy the same tile:

- Use controlled local offsets or another readable stacking strategy.
- Preserve the authoritative tile position.
- Avoid model intersections.
- Ensure all players can identify their character.

## 9. Character Lighting and Rendering

Use a dedicated character-preview scene or lighting configuration.

### Preview Lighting

Implement a cinematic character-lighting rig:

- Soft warm key light.
- Cool fill light.
- Subtle rim light.
- Soft contact shadow.
- Character-colored accent lighting.

The preview should emphasize:

- Facial features.
- Hair materials.
- Costume details.
- Metallic ornaments.
- Weapon silhouettes.
- Skin shading.

### Toon and Anime Materials

Evaluate Three.js-compatible stylized material techniques.

Possible options:

- MeshToonMaterial.
- Custom shader-based toon shading.
- Gradient/ramp lighting.
- Stylized PBR with controlled roughness.
- Hair-specific highlights.
- Selective rim-light shaders.
- Subtle facial shadow control.

Avoid inconsistent shading styles between characters.

### Faces and Eyes

Prioritize excellent facial presentation.

Use:

- High-resolution facial textures.
- Detailed eye materials.
- Eyelashes and eyebrows.
- Subtle blush where appropriate.
- Appropriate specular highlights.
- Eye blinking.
- Facial expressions.

Avoid uncanny or overly realistic skin shading.

## 10. Three.js Asset Requirements

Use GLB/glTF models compatible with the current Three.js environment.

### Model Requirements

Each character should provide:

- Body mesh.
- Materials.
- Skeletal rig.
- Idle animation.
- Movement animation.
- Preview animation where available.
- Attachment points.
- Bounding information.
- Appropriate texture maps.

### Asset Formats

Prefer:

- GLB for runtime character assets.
- KTX2 compressed textures where suitable.
- Shared skeleton conventions.
- Optimized animation clips.

FBX assets may be converted during the asset preparation pipeline rather than used as the preferred runtime format.

### Character Asset Pipeline

Implement:

1. Asset import.
2. Scale normalization.
3. Material validation.
4. Skeleton validation.
5. Animation inspection.
6. Texture optimization.
7. Runtime loading.
8. Animation configuration.
9. Preview validation.
10. Board pawn registration.

If suitable models do not exist, do not silently substitute crude procedural figures for high-quality anime characters.

Provide a documented asset requirement or placeholder strategy and distinguish placeholder content from production-ready character art.

## 11. Animation Architecture

Use Three.js AnimationMixer or the existing animation framework.

Separate:

- Character identity.
- Asset references.
- Animation state.
- Character cosmetics.
- Pawn transform.
- Gameplay state.

Suggested animation states:

```text
IDLE
SELECTED
PREVIEW_POSE
MOVING
JUMPING
LANDING
CELEBRATING
REACTING
```

Use crossfades between compatible animation clips.

Avoid restarting animation mixers unnecessarily.

Allow independent animation for multiple characters.

## 12. Character Data Model

Create a configurable character registry.

Example:

```ts
type CharacterDefinition = {
  id: string;
  name: string;
  age: number;
  archetype: string;
  gender: "female" | "male";
  description: string;

  colors: {
    primary: string;
    secondary: string;
    aura: string;
  };

  assets: {
    model: string;
    portrait: string;
    thumbnail: string;
  };

  animations: {
    idle: string;
    move: string;
    select?: string;
    celebrate?: string;
  };

  scale: {
    preview: number;
    board: number;
  };

  cosmetics?: {
    outfits: string[];
    accessories: string[];
  };
};
```

All character definitions should be data-driven rather than hardcoded into UI components.

The model should support future characters without changing the underlying game engine.

## 13. Suggested Component Architecture

```text
src/game/characters/
  registry/
    CharacterRegistry.ts
    CharacterDefinitions.ts

  assets/
    CharacterAssetLoader.ts
    CharacterModelCache.ts
    CharacterAssetValidator.ts

  rendering/
    CharacterRenderer.ts
    CharacterMaterials.ts
    CharacterEffects.ts
    CharacterLighting.ts

  animation/
    CharacterAnimationController.ts
    AnimationStateMachine.ts

  selection/
    CharacterSelection.tsx
    CharacterGallery.tsx
    CharacterCard.tsx
    CharacterPreview.tsx
    CharacterDetails.tsx

  customization/
    CharacterCustomization.tsx
    OutfitSelector.tsx
    ColorSelector.tsx
    AccessorySelector.tsx

  pawns/
    PawnRenderer.ts
    PawnAnimationController.ts
    PawnPositionController.ts
```

Adapt this structure to the actual repository.

Avoid unnecessary duplication or excessive abstraction.

## 14. Performance Optimization

Character models may become expensive, especially when several appear simultaneously.

Implement:

- Shared asset caching.
- Compressed textures.
- Geometry optimization.
- Animation clip reuse.
- Reduced particle count on the board.
- Appropriate LOD.
- Efficient shadow configuration.
- Resource cleanup.
- Preview rendering on demand.

### Preview vs Board Quality

Use a higher-quality presentation for the selected character preview.

For board pawns:

- Reduce texture resolution if necessary.
- Use simpler materials.
- Reduce particle effects.
- Avoid unnecessary dynamic lights.
- Reduce animation complexity where practical.

Do not load all high-resolution character models immediately if only a few are visible.

### Quality Settings

Support:

- Low: reduced materials and effects.
- Medium: standard materials, animations, and shadows.
- High: advanced shading, better shadows, and full cosmetic effects.

## 15. Character Selection Flow

Implement the following user experience:

1. Player opens character selection.
2. Character gallery displays available heroes.
3. Player selects a character card.
4. The 3D preview loads the chosen model.
5. Preview camera transitions to the character.
6. The character performs an idle or signature animation.
7. Player can rotate and zoom.
8. Player can inspect available outfit variants.
9. Player confirms selection.
10. Existing player state is updated through the current application flow.
11. The selected character becomes the player's board pawn.
12. The pawn retains its customization throughout the match.

Character selection should be fast, intuitive, and visually satisfying.

## 16. Implementation Phases

### Phase 1 — Character Foundation

- Inspect current pawn system.
- Create character registry.
- Define model asset contracts.
- Implement GLB loading.
- Implement rig/animation validation.

### Phase 2 — Character Preview

- Character selection modal.
- Character gallery.
- Full-body 3D preview.
- Orbit and zoom controls.
- Cinematic character lighting.

### Phase 3 — Character Animation

- Idle animation.
- Selection animation.
- Board movement.
- Elevation transitions.
- Animation blending.

### Phase 4 — Customization

- Outfit variants.
- Color customization.
- Accessories.
- Magical aura variants.
- Persisted appearance state.

### Phase 5 — Board Integration

- Replace existing simple pawn models.
- Integrate selected character.
- Update pawn placement and scale.
- Handle multiple pawns.
- Add selection highlights.

### Phase 6 — Optimization

- Model compression.
- Texture optimization.
- Performance profiling.
- Memory leak validation.
- Graphics quality presets.

## 17. Acceptance Criteria

The implementation is successful when:

1. The application's existing UI remains intact.
2. The character-selection interface works correctly.
3. All 12 characters are represented in the roster.
4. Each character has a distinctive visual identity.
5. Character previews support smooth rotation and zoom.
6. Available character models animate correctly.
7. Character selection updates the existing player state.
8. Selected characters appear as pawns on the board.
9. Pawn movement remains compatible with all existing game tiles.
10. Pawns handle different terrain elevations correctly.
11. Multiple pawns can occupy the same tile without visual ambiguity.
12. Character cosmetics do not alter game balance.
13. Character assets load efficiently.
14. The rendering system avoids unnecessary GPU overhead.
15. Asset-dependent features are clearly identified and do not falsely appear complete when production assets are missing.

## Final Visual Vision

Create an unforgettable anime fantasy character experience where players can choose from a roster of beautiful, charismatic adult heroines and attractive male heroes.

Each character should feel like a premium collectible figurine brought to life.

Character selection should be visually exciting, with expressive animations, detailed costumes, magical effects, and cinematic presentation.

On the board, the characters should remain elegant, recognizable, and beautifully integrated into the fantasy environment.

The final character system should combine the charm of anime RPG design, the quality of modern 3D character rendering, and the practicality of a performant browser-based Three.js game.

**Prioritize character quality, distinctive appearance, smooth animations, and excellent 3D previews over unnecessary complexity.**