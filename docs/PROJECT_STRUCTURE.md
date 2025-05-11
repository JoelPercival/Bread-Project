# BreadMaster Project Structure

## Overview

This document outlines the organization of the BreadMaster codebase, which follows a feature-first architecture pattern. This approach organizes code based on functional features rather than technical concerns, making it easier to understand, maintain, and extend the application.

## Directory Structure

```
src/
├── app/                  # Application entry points
│   ├── App.tsx           # Main App component
│   └── routes.tsx        # Centralized routing configuration
│
├── features/             # Feature-specific modules
│   ├── recipes/          # Recipe management feature
│   │   ├── components/   # UI components specific to recipes
│   │   ├── services/     # Recipe-specific services
│   │   └── store/        # Recipe state management
│   │
│   ├── baking/           # Baking process feature
│   │   ├── components/   # UI components for baking
│   │   ├── services/     # Baking-specific services
│   │   └── store/        # Baking state management
│   │
│   ├── analysis/         # Baking analysis feature
│   │   ├── components/   # Analysis UI components
│   │   └── store/        # Analysis state management
│   │
│   └── settings/         # Application settings feature
│       └── components/   # Settings UI components
│
├── shared/               # Shared resources used across features
│   ├── components/       # Reusable UI components
│   │   ├── buttons/      # Button components
│   │   ├── cards/        # Card components
│   │   ├── layout/       # Layout components
│   │   ├── sliders/      # Slider components
│   │   ├── ratings/      # Rating components
│   │   └── sortable/     # Drag-and-drop components
│   │
│   ├── services/         # Shared services
│   │   └── storageService.ts # Storage abstraction service
│   │
│   └── store/            # Shared store utilities
│       └── storage.ts    # Storage adapter for Zustand
│
├── store/                # Main store integration point
│   └── index.ts          # Exports and combines feature-specific stores
│
└── types/                # TypeScript type definitions
    └── index.ts          # Application-wide type definitions
```

## Feature-First Organization

The codebase is organized around features rather than technical concerns. Each feature directory contains everything related to that feature, including components, services, and state management. This approach offers several benefits:

1. **Improved Developer Experience**: Easier to understand and navigate the codebase
2. **Better Maintainability**: Changes to a feature are localized to its directory
3. **Enhanced Collaboration**: Multiple developers can work on different features with minimal conflicts
4. **Scalability**: New features can be added without impacting existing ones

## State Management

State management follows the same feature-first approach:

1. **Feature-Specific Stores**: Each feature has its own Zustand store that manages only its relevant state
2. **Shared Store Index**: The main `store/index.ts` file combines all feature stores for easy access
3. **Cross-Feature Access**: Features can access data from other features when needed through exported selectors

## Components

UI components are categorized as:

1. **Feature Components**: Components specific to a particular feature (in the feature's components directory)
2. **Shared Components**: Reusable UI components used across multiple features (in the shared/components directory)

## Services

Services follow a similar pattern:

1. **Feature-Specific Services**: Services used only by a specific feature
2. **Shared Services**: Core services used across multiple features

## Adding New Features

To add a new feature:

1. Create a new directory under `src/features/`
2. Add the required subdirectories (components, services, store)
3. Implement the feature-specific code
4. If necessary, export the feature's store in `src/store/index.ts`

## Conclusion

This feature-first architecture provides a clear, maintainable structure that scales well as the application grows. By keeping related code together and separating concerns based on features, the codebase becomes more intuitive to work with and easier to extend.
