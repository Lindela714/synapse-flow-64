# Your AI Workspace

Integrated AI Productivity Assistant — Full Build Prompt

Build a polished, production-quality AI Productivity Assistant as one integrated web application containing three connected features:

Core Concept

Create one unified workspace that combines:

Smart Email Generator

Meeting Notes Summarizer

AI Task Planner

These must work together as a single product. Do not build three disconnected pages. Information generated in one feature should be usable by the others.

The main workflow should be:

Capture → Understand → Plan → Communicate

For example:

Meeting Notes → AI Summary → Action Items → Tasks → Follow-up Email

1. Smart Email Generator

Create an AI-powered email writing workspace.

Inputs

Allow the user to provide:

Email purpose

Recipient/context

Key points

Desired tone

Desired length

Optional meeting notes or task information

AI capabilities

Generate:

Email subject

Complete email body

Appropriate greeting and sign-off

Support tones such as:

Professional

Friendly

Formal

Concise

Persuasive

Follow-up

Add AI actions:

Make shorter

Make longer

Make more professional

Make friendlier

Improve clarity

Fix grammar

Regenerate

Include a Copy Email button.

The email generator should also be able to automatically use information from meeting summaries and tasks.

Example:

"Create a follow-up email from my latest meeting."

The system should retrieve the relevant meeting summary and action items and generate the email.

2. Meeting Notes Summarizer

Create a workspace where users can paste meeting notes or transcripts.

Allow:

Large text input

Paste transcript

Upload a text-based file if supported

Clear/reset notes

The AI should analyze the content and produce:

Summary

A concise overview of the meeting.

Key Discussion Points

Identify the most important topics discussed.

Decisions

Identify decisions that were made.

Action Items

Extract actionable tasks and, where possible, identify:

Task

Owner

Priority

Suggested due date

Open Questions

Identify unresolved questions or issues.

Follow-up

Provide a button:

Generate Follow-up Email

This should send the meeting information directly into the Smart Email Generator.

Convert to Tasks

Provide:

Create Tasks

This should automatically create the extracted action items inside the AI Task Planner.

3. AI Task Planner

Create a complete task management workspace.

Users should be able to create tasks manually or generate them using AI.

Each task should support:

Task name

Description

Priority

Status

Due date

Category/project

Optional owner

Creation date

Use statuses:

To Do

In Progress

Completed

Use priorities:

Low

Medium

High

Urgent

Task views

Provide:

List view

Kanban board

Today's tasks

Upcoming tasks

Overdue tasks

Completed tasks

AI Planning

Add an AI planning interface where the user can enter a goal such as:

"Launch our new marketing website."

The AI should break the goal into logical tasks and subtasks.

For example:

Launch Marketing Website

→ Finalize copy

→ Design landing page

→ Develop website

→ Test responsive layouts

→ Configure analytics

→ Review SEO

→ Deploy website

Allow users to add the generated plan to their task list.

AI Task Actions

Allow users to ask AI to:

Prioritize my tasks

Break this task into smaller tasks

Create a schedule

Find overdue tasks

Reorganize my workload

Suggest deadlines

Summarize my workload

Identify the most important task

4. Unified AI Assistant

Add a central AI assistant throughout the application.

The assistant should understand the current context and connect all three features.

Examples:

Meeting context

"Summarize these notes and create tasks for everything that needs to be done."

Task context

"Turn my high-priority tasks into a progress update email."

Email context

"Write a follow-up email based on the meeting and include the outstanding tasks."

General context

"What should I focus on today?"

The assistant should use information already available in the application rather than requiring the user to repeatedly copy and paste information.

5. Dashboard

Create a central dashboard that acts as the application's home screen.

Display:

Today's Overview

Tasks due today

Overdue tasks

High-priority tasks

Completed tasks

Recent Activity

Recent meeting summaries

Recently generated emails

Recently created tasks

Quick Actions

Include prominent buttons:

Generate Email

Summarize Meeting

Create Task

Plan a Goal

AI Insights

Add an AI-generated section such as:

"You have 5 high-priority tasks this week. Two are overdue. Your next recommended action is..."

6. Deep Integration Between Features

This is extremely important.

Do not treat the three tools as separate applications.

Implement direct workflows such as:

Meeting → Tasks

Meeting notes:

"John will prepare the Q3 report by Friday."

AI extracts:

Task: Prepare Q3 report

Owner: John

Due: Friday

The user clicks Create Task, and it appears immediately in the Task Planner.

Meeting → Email

After summarizing a meeting, the user clicks:

Generate Follow-up Email

The email generator automatically receives:

Meeting summary

Decisions

Action items

Participants/context

Tasks → Email

Allow the user to select tasks and click:

Generate Progress Email

The AI creates an email summarizing the selected tasks.

Goal → Tasks

The user enters a large goal.

AI creates a structured plan.

The user clicks:

Add Plan to Task Planner

All generated tasks are added automatically.

7. UI/UX Design

Use a modern, clean productivity SaaS interface.

Navigation

Use a persistent sidebar containing:

Dashboard

Email Generator

Meeting Notes

Task Planner

Also include:

Search

AI Assistant

Settings/preferences

Do not create an authentication/account section.

Design language

Use:

Clean cards

Rounded corners

Subtle shadows

Clear typography

Professional color palette

Consistent spacing

Smooth transitions

Helpful empty states

Toast notifications

Skeleton/loading states

Make the application feel premium but simple.

It should be responsive across:

Desktop

Tablet

Mobile

8. Data Management

Use a simple local data layer so the application works immediately without requiring an account.

Persist application data locally where appropriate.

Store:

Tasks

Meeting notes

Meeting summaries

Generated emails

User preferences

Recent activity

Create reusable data models and services rather than storing everything directly inside individual UI components.

9. AI Architecture

Create a modular AI service.

For example, separate AI operations into functions such as:

generateEmail()

summarizeMeeting()

extractActionItems()

generateTasksFromGoal()

prioritizeTasks()

generateFollowUpEmail()

generateTaskPlan()

Keep the AI provider separate from the UI.

If no AI API is configured, provide a mock/demo AI implementation so the application can still be fully demonstrated.

The application must not require authentication or an account to use the demo functionality.

10. No Authentication

Do not implement authentication of any kind.

Specifically do not include:

Login

Signup

Registration

OAuth

Passwords

Sessions

User accounts

Authentication middleware

Protected routes

Authentication screens

The application should load directly into the dashboard and be immediately usable.

11. Quality Requirements

Make the project feel like a complete real-world application rather than a collection of mock screens.

Include:

Responsive design

Proper loading states

Error handling

Empty states

Form validation

Confirmation dialogs where appropriate

Toast notifications

Accessible buttons and inputs

Keyboard-friendly interactions

Reusable components

Clean architecture

Consistent styling

Smooth transitions

Real interactions between all three modules

Avoid placeholder buttons that do nothing.

Every major action should have a working flow.

Final Product Goal

The finished application should feel like a single AI-powered productivity command center.

The core experience should be:

Meetings create information → AI understands the information → AI turns it into tasks → Tasks are managed and prioritized → AI turns progress back into communication.

Build the entire experience around this connected workflow rather than treating Email, Meetings, and Tasks as independent features.

Do not add authentication. Open directly to the application dashboard.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://synapse-flow-64.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/21d2ba6f-25db-4491-b943-86f93d25d648).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
