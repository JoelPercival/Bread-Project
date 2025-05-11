# Recipes Feature

## Overview

The Recipes feature handles all functionality related to creating, viewing, editing, and managing bread recipes. It is a core feature of the BreadMaster application that enables users to create and customize bread recipes with various parameters like hydration, flour types, and baking stages.

## Components

- **RecipesPage**: Main page that displays a list of all recipes with search functionality
- **RecipeDetailPage**: Page for viewing and editing an existing recipe
- **RecipeForm**: Form component for creating and editing recipes
- **RecipeCard**: Card component for displaying recipe summaries in a list
- **FlourTypeSelector**: Component for selecting and configuring flour types used in a recipe
- **BakingStageEditor**: Component for managing the baking stages of a recipe

## Services

- **recipeService**: Handles recipe calculations, default values, and recipe-specific business logic

## Store

The recipe store (`recipeStore.ts`) manages all recipe-related state, including:

- List of all recipes
- Current active recipe
- Actions for creating, updating, and deleting recipes
- Recipe duplication functionality
- Default recipe configuration values

## Usage

The Recipes feature is typically accessed through the main navigation by clicking on "Recipes". From there, users can:

1. View all their saved recipes
2. Search for specific recipes
3. Create new recipes
4. Edit existing recipes
5. Delete recipes they no longer need
6. Start baking sessions based on recipes

## Integration Points

The Recipes feature integrates with:

- **Baking Feature**: Recipes are used to initiate baking sessions
- **Analysis Feature**: Recipes are referenced when analyzing baking results
- **Shared Components**: Uses buttons, cards, and other shared UI components
