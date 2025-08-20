# Styling Architecture - BDD Testing Plan

## 📚 **Navigation**
- **[← Back to Styling Architecture](STYLING_ARCHITECTURE.md)**
- **[← Back to Overview](ARCHITECTURE_OVERVIEW.md)**

---

## 🎯 **BDD Testing Overview**

This document defines the BDD testing strategy for the Material Design 3 (M3) styling architecture. We use Angular's native testing framework with Jasmine to achieve BDD benefits through behavioral specifications and naming conventions.

### **Testing Philosophy**
- **BDD is a methodology, not a tool** - We achieve BDD benefits using Angular's native testing framework
- **Real Component Testing** - Test actual Angular components via TestBed, not mocks
- **User-Centric Scenarios** - Focus on how users interact with the theme system
- **Behavioral Specifications** - Test what the system does, not how it does it

---

## 🌓 **Feature: Theme Toggle System**

### **Scenario: User toggles between light and dark themes**

**Test Case 1: Light to Dark Theme Switch**
- **Given**: User is on light theme
- **When**: User clicks theme toggle button
- **Then**: Theme switches to dark mode

**Test Case 2: Dark to Light Theme Switch**
- **Given**: User is on dark theme
- **When**: User clicks theme toggle button
- **Then**: Theme switches to light mode

**What We Test:**
- Theme toggle button responds to user clicks
- `data-theme` attribute changes on the document root
- Theme service state updates correctly
- Visual feedback shows current theme state

---

## 🎨 **Feature: Material Design 3 Color System**

### **Scenario: CSS custom properties apply correct M3 colors**

**Test Case 1: Light Theme Colors**
- **Given**: Theme is set to light mode
- **When**: Page loads and theme is applied
- **Then**: M3 light theme colors are correctly applied

**Test Case 2: Dark Theme Colors**
- **Given**: Theme is set to dark mode
- **When**: Page loads and theme is applied
- **Then**: M3 dark theme colors are correctly applied

**What We Test:**
- CSS custom properties are accessible and set correctly
- Color tokens match Material Design 3 specifications
- Theme switching updates all color variables
- Colors are consistent across the application

---

## 🎭 **Feature: Component Styling Integration**

### **Scenario: Components inherit M3 theme colors correctly**

**Test Case: Theme Color Inheritance**
- **Given**: Theme is set to light mode initially
- **When**: Theme is switched to dark mode
- **Then**: Components use correct dark theme colors

**What We Test:**
- Components automatically inherit theme colors
- Color changes propagate to all child components
- No hardcoded colors override theme system
- Consistent styling across component library

---

## 📱 **Feature: Responsive Design System**

### **Scenario: Components adapt to different screen sizes**

**Test Case 1: Mobile Viewport**
- **Given**: Mobile viewport is simulated (375x667)
- **When**: Components render
- **Then**: Mobile-first responsive styles are applied

**Test Case 2: Tablet Viewport**
- **Given**: Tablet viewport is simulated (768x1024)
- **When**: Components render
- **Then**: Tablet breakpoint responsive styles are applied

**What We Test:**
- Breakpoint system responds to viewport changes
- Components adapt layout and spacing appropriately
- Mobile-first approach works correctly
- Responsive utilities function as expected

---

## 🧪 **Feature: Theme Service Behavior**

### **Scenario: Theme service manages user preferences correctly**

**Test Case 1: Theme Persistence**
- **Given**: User sets theme to dark mode
- **When**: App restarts and theme service reinitializes
- **Then**: Saved dark theme preference is restored

**Test Case 2: System Theme Detection**
- **Given**: System prefers dark theme
- **When**: Auto theme mode is enabled
- **Then**: System dark theme preference is automatically applied

**What We Test:**
- Theme preferences are saved to localStorage
- Preferences persist across app restarts
- System theme detection works correctly
- Auto mode respects user's system preference

---

## 🎨 **Feature: Theme Toggle Component UI**

### **Scenario: Theme toggle button provides clear visual feedback**

**Test Case 1: Light Theme State**
- **Given**: Theme is set to light mode
- **When**: Toggle button renders
- **Then**: Light theme icon is visible and active

**Test Case 2: Dark Theme State**
- **Given**: Theme is set to dark mode
- **When**: Toggle button renders
- **Then**: Dark theme icon is highlighted

**What We Test:**
- Icons show current theme state clearly
- Visual feedback is immediate and obvious
- Button accessibility attributes are correct
- Hover and focus states work properly

---

## 🔧 **Feature: Theme Color Validation**

### **Scenario: Theme colors are properly applied and accessible**

**Test Case 1: Light Theme Colors**
- **Given**: Light theme is active
- **When**: Text renders
- **Then**: Light theme colors are correctly set

**Test Case 2: Dark Theme Colors**
- **Given**: Dark theme is active
- **When**: Text renders
- **Then**: Dark theme colors are correctly set

**What We Test:**
- CSS custom properties are properly defined
- Theme colors are accessible to components
- Color system is consistent and reliable
- No missing or undefined color values

---

## 📋 **BDD Test Organization**

### **Test File Naming Convention**
- **Component Tests**: `component-name-bdd.component.spec.ts`
- **Service Tests**: `service-name-bdd.service.spec.ts`
- **Integration Tests**: `feature-name-bdd.integration.spec.ts`

### **Test Structure Pattern**
Here's one example of how the BDD structure looks in practice:

```typescript
describe('Feature: Theme Toggle System', () => {
  describe('Scenario: User toggles between light and dark themes', () => {
    it('Given user is on light theme, When user clicks theme toggle, Then theme switches to dark', () => {
      // Given: Set up the context/preconditions
      console.log(`🔧 BDD: User is on light theme`);
      // Setup code here
      
      // When: Perform the action
      console.log(`⚙️ BDD: User clicks theme toggle button`);
      // Action code here
      
      // Then: Verify the outcome
      console.log(`✅ BDD: Theme switches to dark mode`);
      // Verification code here
    });
  });
});
```

### **Console Logging Convention**
- `🔧 BDD:` Setup/Given statements (blue tools)
- `⚙️ BDD:` Actions/When statements (yellow gear)
- `✅ BDD:` Success/Then verifications (green check)
- `❌ BDD:` Expected errors/failures (red X)
- `📝 BDD:` Form submissions/data operations (memo)
- `🧭 BDD:` Navigation operations (compass)

---

## 🎯 **Testing Priorities**

### **Phase 1: Core Theme Functionality**
1. **Theme Toggle Service** - Basic theme switching and persistence
2. **CSS Custom Properties** - M3 color system application
3. **Theme Toggle Component** - UI interaction and visual feedback

### **Phase 2: Component Integration**
1. **Button Components** - Theme color inheritance
2. **Card Components** - Elevation and surface styling
3. **Form Components** - Input styling and validation states

### **Phase 3: Advanced Features**
1. **Responsive Design** - Breakpoint system testing
2. **Theme Color Validation** - CSS custom properties verification
3. **Performance** - Theme switching performance

---

## 🔗 **Related Documentation**

- **[Styling Architecture](STYLING_ARCHITECTURE.md)** - Main styling architecture document
- **[BDD Testing Strategy](BDD_TESTING_STRATEGY.md)** - General BDD methodology
- **[Component Architecture](COMPONENT_ARCHITECTURE.md)** - Component design patterns

---

*This BDD testing plan ensures that the styling architecture behaves correctly from a user perspective, focusing on real user scenarios and business requirements rather than implementation details.*
