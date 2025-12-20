import { Editor } from "./editor";
import type { ComponentTree } from "./types/component";

const initialTree: ComponentTree = [
  // Page - Root container
  {
    label: "Page Layout",
    id: "0",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Page",
    },
  },

  // Navbar Section
  {
    label: "Navigation Section",
    id: "nav-section",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Section",
      props: {
        containerType: "default",
        pageHeight: false,
      },
    },
    parentId: "0",
  },
  {
    label: "Navbar",
    id: "navbar",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Navbar",
    },
    parentId: "nav-section",
  },
  {
    label: "Nav Item - Home",
    id: "nav-home",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "NavItem",
      props: {
        href: "#home",
        active: true,
      },
    },
    parentId: "navbar",
  },
  {
    label: "Nav Home Text",
    id: "nav-home-text",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Home",
        type: "span",
      },
    },
    parentId: "nav-home",
  },
  {
    label: "Nav Item - About",
    id: "nav-about",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "NavItem",
      props: {
        href: "#about",
        active: false,
      },
    },
    parentId: "navbar",
  },
  {
    label: "Nav About Text",
    id: "nav-about-text",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "About",
        type: "span",
      },
    },
    parentId: "nav-about",
  },

  // Hero Section
  {
    label: "Hero Section",
    id: "hero-section",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Section",
      props: {
        containerType: "default",
        pageHeight: true,
      },
    },
    parentId: "0",
  },
  {
    label: "Hero Container",
    id: "hero-container",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Container",
    },
    parentId: "hero-section",
  },
  {
    label: "Hero Row",
    id: "hero-row",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Row",
      props: {
        verticalAlignment: "center",
        horizontalAlignment: "center",
        fullHeight: true,
        gap: 2,
      },
    },
    parentId: "hero-container",
  },
  {
    label: "Hero Stack",
    id: "hero-stack",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Stack",
    },
    parentId: "hero-row",
  },
  {
    label: "Hero Title",
    id: "hero-title",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Welcome to WD Builder",
        type: "h1",
      },
    },
    parentId: "hero-stack",
  },
  {
    label: "Hero Subtitle",
    id: "hero-subtitle",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Build beautiful websites with ease using our component library",
        type: "p",
      },
    },
    parentId: "hero-stack",
  },
  {
    label: "Hero Button Primary",
    id: "hero-btn-primary",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Button",
      props: {
        variant: "primary",
      },
    },
    parentId: "hero-stack",
  },
  {
    label: "Hero Button Text",
    id: "hero-btn-text",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Get Started",
        type: "span",
      },
    },
    parentId: "hero-btn-primary",
  },
  {
    label: "Hero Link Button",
    id: "hero-link-btn",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "LinkButton",
      props: {
        href: "#features",
        label: "Learn More",
        variant: "secondary",
      },
    },
    parentId: "hero-stack",
  },

  // Features Section with Grid
  {
    label: "Features Section",
    id: "features-section",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Section",
      props: {
        containerType: "default",
        pageHeight: false,
      },
    },
    parentId: "0",
  },
  {
    label: "Features Grid",
    id: "features-grid",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Grid",
      props: {
        columns: 3,
        fullWidth: true,
      },
    },
    parentId: "features-section",
  },
  {
    label: "Feature 1 Stack",
    id: "feature-1",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Stack",
    },
    parentId: "features-grid",
  },
  {
    label: "Feature 1 Icon",
    id: "feature-1-icon",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Icon",
      props: {
        icon: "DropIconSVG",
      },
    },
    parentId: "feature-1",
  },
  {
    label: "Feature 1 Title",
    id: "feature-1-title",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Design System",
        type: "h3",
      },
    },
    parentId: "feature-1",
  },
  {
    label: "Feature 2 Stack",
    id: "feature-2",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Stack",
    },
    parentId: "features-grid",
  },
  {
    label: "Feature 2 Icon",
    id: "feature-2-icon",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Icon",
      props: {
        icon: "FigmaIconSVG",
      },
    },
    parentId: "feature-2",
  },
  {
    label: "Feature 2 Title",
    id: "feature-2-title",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Figma Integration",
        type: "h3",
      },
    },
    parentId: "feature-2",
  },
  {
    label: "Feature 3 Stack",
    id: "feature-3",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Stack",
    },
    parentId: "features-grid",
  },
  {
    label: "Feature 3 Icon",
    id: "feature-3-icon",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Icon",
      props: {
        icon: "GithubIconSVG",
      },
    },
    parentId: "feature-3",
  },
  {
    label: "Feature 3 Title",
    id: "feature-3-title",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Open Source",
        type: "h3",
      },
    },
    parentId: "feature-3",
  },

  // Form Section with Input
  {
    label: "Form Section",
    id: "form-section",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Section",
      props: {
        containerType: "default",
        pageHeight: false,
      },
    },
    parentId: "0",
  },
  {
    label: "Form Row",
    id: "form-row",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Row",
      props: {
        verticalAlignment: "center",
        horizontalAlignment: "center",
        fullHeight: false,
        gap: 1,
      },
    },
    parentId: "form-section",
  },
  {
    label: "Form Stack",
    id: "form-stack",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Stack",
    },
    parentId: "form-row",
  },
  {
    label: "Form Title",
    id: "form-title",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Contact Us",
        type: "h2",
      },
    },
    parentId: "form-stack",
  },
  {
    label: "Email Input",
    id: "email-input",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Input",
      props: {
        name: "email",
        placeholder: "Enter your email",
        type: "email",
        iconLeft: "MenuIconSVG",
      },
    },
    parentId: "form-stack",
  },
  {
    label: "Password Input",
    id: "password-input",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Input",
      props: {
        name: "password",
        placeholder: "Enter your password",
        type: "password",
        iconRight: "MoonIconSVG",
      },
    },
    parentId: "form-stack",
  },
  {
    label: "Submit Button",
    id: "submit-btn",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Button",
      props: {
        variant: "primary",
      },
    },
    parentId: "form-stack",
  },
  {
    label: "Submit Button Text",
    id: "submit-btn-text",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Submit",
        type: "span",
      },
    },
    parentId: "submit-btn",
  },

  // Sidebar Demo Section
  {
    label: "Sidebar Section",
    id: "sidebar-section",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Section",
      props: {
        containerType: "default",
        pageHeight: false,
      },
    },
    parentId: "0",
  },
  {
    label: "Sidebar Row",
    id: "sidebar-row",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Row",
      props: {
        verticalAlignment: "top",
        horizontalAlignment: "left",
        fullHeight: false,
        gap: 2,
      },
    },
    parentId: "sidebar-section",
  },
  {
    label: "SideBar",
    id: "sidebar",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "SideBar",
    },
    parentId: "sidebar-row",
  },
  {
    label: "Sidebar NavItem 1",
    id: "sidebar-nav-1",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "NavItem",
      props: {
        href: "#dashboard",
        active: true,
      },
    },
    parentId: "sidebar",
  },
  {
    label: "Sidebar Nav 1 Text",
    id: "sidebar-nav-1-text",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Dashboard",
        type: "span",
      },
    },
    parentId: "sidebar-nav-1",
  },
  {
    label: "Sidebar NavItem 2",
    id: "sidebar-nav-2",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "NavItem",
      props: {
        href: "#settings",
        active: false,
      },
    },
    parentId: "sidebar",
  },
  {
    label: "Sidebar Nav 2 Text",
    id: "sidebar-nav-2-text",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Settings",
        type: "span",
      },
    },
    parentId: "sidebar-nav-2",
  },
  {
    label: "Sidebar Content",
    id: "sidebar-content",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Stack",
    },
    parentId: "sidebar-row",
  },
  {
    label: "Sidebar Content Title",
    id: "sidebar-content-title",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Sidebar + Content Layout",
        type: "h2",
      },
    },
    parentId: "sidebar-content",
  },
  {
    label: "Sidebar Content Text",
    id: "sidebar-content-text",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value:
          "This demonstrates a common layout pattern with a sidebar navigation and main content area.",
        type: "p",
      },
    },
    parentId: "sidebar-content",
  },

  // Icons Showcase Section
  {
    label: "Icons Section",
    id: "icons-section",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Section",
      props: {
        containerType: "default",
        pageHeight: false,
      },
    },
    parentId: "0",
  },
  {
    label: "Icons Title",
    id: "icons-title",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Available Icons",
        type: "h2",
      },
    },
    parentId: "icons-section",
  },
  {
    label: "Icons Row",
    id: "icons-row",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Row",
      props: {
        verticalAlignment: "center",
        horizontalAlignment: "center",
        fullHeight: false,
        gap: 2,
      },
    },
    parentId: "icons-section",
  },
  {
    label: "Menu Icon",
    id: "icon-menu",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Icon",
      props: {
        icon: "MenuIconSVG",
      },
    },
    parentId: "icons-row",
  },
  {
    label: "Github Icon",
    id: "icon-github",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Icon",
      props: {
        icon: "GithubIconSVG",
      },
    },
    parentId: "icons-row",
  },
  {
    label: "Linkedin Icon",
    id: "icon-linkedin",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Icon",
      props: {
        icon: "LinkedinIconSVG",
      },
    },
    parentId: "icons-row",
  },
  {
    label: "Figma Icon",
    id: "icon-figma",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Icon",
      props: {
        icon: "FigmaIconSVG",
      },
    },
    parentId: "icons-row",
  },
  {
    label: "Drop Icon",
    id: "icon-drop",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Icon",
      props: {
        icon: "DropIconSVG",
      },
    },
    parentId: "icons-row",
  },
  {
    label: "Moon Icon",
    id: "icon-moon",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Icon",
      props: {
        icon: "MoonIconSVG",
      },
    },
    parentId: "icons-row",
  },
  {
    label: "Sun Icon",
    id: "icon-sun",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Icon",
      props: {
        icon: "SunIconSVG",
      },
    },
    parentId: "icons-row",
  },
  {
    label: "WD Icon",
    id: "icon-wd",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Icon",
      props: {
        icon: "WdIconSVG",
      },
    },
    parentId: "icons-row",
  },
  {
    label: "Picture Icon",
    id: "icon-picture",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Icon",
      props: {
        icon: "PictureIconSVG",
      },
    },
    parentId: "icons-row",
  },
];

import { createRoot } from "react-dom/client";

const container = document.getElementById("app");
if (!container) {
  throw new Error("Root element #app not found");
}
const root = createRoot(container);
root.render(<Editor initialTree={initialTree} />);
