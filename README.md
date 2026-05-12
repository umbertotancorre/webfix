# Webfix

A Chrome extension for personal use that declutters and enhances browsing on YouTube, LinkedIn, Gmail, Google Calendar, and X (Twitter).

## Features

### Browser-wide
- **Tab numbering** - Adds `1.`, `2.`, etc. prefix to tab titles
- **Site blocking** - Redirect Instagram, YouTube, LinkedIn, and X to a blank page
- **Search shortcut** - Press `s` to focus the search bar on YouTube and LinkedIn
- **Settings popup** - Click the extension icon to open a Shadow DOM-isolated panel to toggle all features on/off

### YouTube
- Hide "More from YouTube" sidebar section
- Hide "Explore" sidebar section
- Hide Settings/Help/Report history sidebar section
- Hide sidebar footer
- Hide Create button
- Hide Notifications button
- Hide "Auto-dubbed" badge
- Hide "Your watch history is off" feed nudge
- Hide all Shorts (sidebar, homepage feed, search results, carousels)
- Hide video suggestions sidebar on watch pages

### LinkedIn
- Search shortcut (`s` key)

### Gmail
- Hide Upgrade button

### Google Calendar
- Hide Terms & Privacy footer
- Hide Booking pages section
- Hide Support button
- Hide side panel toggle
- Hide Create button
- Hide Calendar/Tasks switcher icon
- Hide "Search for people" box
- Hide side panel mini-month
- Hide Birthdays calendar
- Hide Tasks calendar
- Hide "Today" navigation button
- Hide view switcher (Day/Week/Month/Year dropdown)
- Compact calendar list after hiding items

### X / Twitter
- Hide Communities
- Hide Creator Studio

## Installation

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `webfix` folder

## Usage

Click the Webfix extension icon in the toolbar to open the settings panel. Toggle any feature on or off. Most changes apply immediately. Site blocking changes require a page reload.

## Permissions

- `activeTab` - Access the current tab for modifications
- `storage` - Save settings across sessions
- `tabs` - Query and manage tabs for tab numbering
- `host_permissions` (`<all_urls>`) - Apply UI changes across all sites
