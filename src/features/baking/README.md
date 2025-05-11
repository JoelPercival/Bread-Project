# Baking Feature

## Overview

The Baking feature manages the active bread baking process, helping users track timing, progress, and actions during a baking session. It provides tools to monitor each stage of the baking process, set timers, and record notes and observations.

## Components

- **BakeTimer**: Core component for tracking and managing the current baking session
- **StageCard**: Displays information about a specific baking stage
- **SortableStageCard**: Draggable version of StageCard for reordering stages
- **BakeTimerPage**: Page that hosts the bake timer functionality
- **NewBakePage**: Page for starting a new baking session based on a recipe
- **TimingsPage**: Overview page showing all active baking sessions

## Store

The baking store (`bakingStore.ts`) manages all bake session-related state, including:

- List of all baking sessions
- Current active baking session
- Stage progress tracking
- Timer management
- Session completion actions

## Key Features

- **Real-time Progress Tracking**: Visualize and track the progress of each baking stage
- **Stage Management**: Mark stages as complete and move to the next stage
- **Timer Functionality**: Set and manage timers for each baking stage
- **Session Notes**: Record observations and notes during the baking process
- **Drag and Drop Reordering**: Easily reorganize stages as needed

## Usage

The Baking feature is typically accessed from the Recipes feature when a user wants to start baking a specific recipe. The workflow is:

1. Select a recipe from the Recipes page
2. Click "Start Baking" to initiate a baking session
3. Follow along with the baking stages presented in the BakeTimer
4. Mark stages as complete as you progress
5. Add notes and observations during the process
6. Complete the baking session when finished

## Integration Points

The Baking feature integrates with:

- **Recipes Feature**: Uses recipe data as the foundation for baking sessions
- **Analysis Feature**: Completed baking sessions provide data for analysis
- **Shared Services**: Relies on storage service for data persistence
- **Shared Components**: Uses the sortable context for drag-and-drop functionality
