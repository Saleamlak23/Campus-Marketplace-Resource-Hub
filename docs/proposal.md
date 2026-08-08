# Project Proposal: Campus Marketplace & Resource Hub

**Team Size:** 5 members
**Team Members:** Saleamlak Setie, Rufta Gaiem, Tesfaye Tilahun, Robin Mulugeta, Yared Teweldebirhan
**Date:** [Submission Date]
**Course / Program:** [Course Name, if applicable]

---

## 1. Introduction

University students routinely face the same set of recurring, avoidable problems: overpriced new textbooks when perfectly good used copies exist on the same campus, difficulty finding peer tutors for specific courses, no central place to find past exam papers, and no easy way to rent or borrow equipment for short-term academic needs. These problems are typically solved informally — through scattered social media posts, physical notice boards, or word of mouth — none of which scale, persist, or are searchable.

This project proposes **Campus Marketplace & Resource Hub**, a full-stack web platform that brings these informal, fragmented exchanges into a single, structured, searchable system — built to serve any university, not just one.

---

## 2. Problem Statement

- Students overpay for textbooks that other students on the same campus would happily resell.
- Finding a peer tutor for a specific course is inconsistent and relies on personal networks.
- Past exam papers, a valuable study resource, are shared informally and inconsistently, often lost between cohorts.
- Equipment needed briefly (calculators, drafting tools, lab equipment, etc.) has no structured rental system among students.
- Existing general-purpose marketplace apps (Facebook Marketplace, Telegram groups) are not tailored to a student's context — no course tagging, no department filtering, no trust signal that the other party is a verified student.

---

## 3. Proposed Solution

A web application scoped around verified university communities, where:
- Students sign up using their official university email, which automatically places them into their university's community.
- Students can list and browse textbooks, equipment, and past exam papers relevant to their courses and departments.
- Students can offer or seek peer tutoring by subject.
- Real-time chat connects buyers and sellers, or students and tutors, directly within the platform.
- The platform is architected to support multiple universities simultaneously, with each university's data and community kept separate, so it can scale beyond a single campus without redesign.

---

## 4. Objectives

1. Build a functional, deployed full-stack web application within the project timeline.
2. Design a data model and system architecture that supports multiple universities from the outset, not as an afterthought.
3. Implement secure authentication with role-based access control.
4. Deliver core marketplace functionality: listings, search/filter, real-time chat.
5. Deliver a working admin/moderation layer to keep the platform usable and safe.
6. Produce a portfolio-quality deliverable: clean code, clear documentation, and a live demo suitable for presenting to recruiters or in a viva/defense setting.
7. Divide work meaningfully across all 5 team members so each person can speak to both frontend and backend contributions.

---

## 5. Scope

### In Scope (MVP)
- University-verified signup/login
- Create, edit, delete, and browse listings (textbooks, equipment, exam papers, tutoring)
- Search and category/department filtering
- Real-time 1:1 chat tied to a listing
- Marking listings as sold/available
- Basic admin capabilities: delete listing, ban user
- Multi-university data scoping (students only see their own university's content)

### Out of Scope (v1) / Future Work
- In-app payments (Chapa integration) — deferred to a later phase; payment is arranged off-platform in v1
- Formal tutoring booking/scheduling system — tutoring is handled as a listing category with contact via chat in v1
- Reviews and ratings
- Reported-content moderation queue and platform-wide analytics dashboard
- Self-service university onboarding request flow

*(Full detail on phased scope is available in the accompanying `plan.md`.)*

---

## 6. Methodology / Approach

- **Team structure:** 5 members split across backend, frontend, and a dedicated real-time/full-stack owner for the chat module (see `plan.md` for full role breakdown).
- **Development process:** Agile-style weekly sprints with clear weekly goals, tracked via a shared GitHub project board.
- **Version control:** Git/GitHub with feature branches and pull request review before merging to main.
- **Communication:** Regular team check-ins to track progress and unblock dependencies between frontend and backend work.
- **Testing:** Manual testing of core flows per module before integration; shared Postman collection for API verification across the team.

---

## 7. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router |
| Backend | Node.js, Express, PostgreSQL, Prisma ORM |
| Real-time | Socket.io |
| Auth | JWT-based authentication with role-based access control |
| File Storage | Cloudinary |
| Payments (future phase) | Chapa API |
| Deployment | Vercel (frontend), Railway/Render (backend + database) |
| Tooling | GitHub, ESLint, Prettier, GitHub Actions (CI), Postman |

*(Full rationale for stack choices is available in the accompanying `plan.md`.)*

---

## 8. System Architecture Overview

The system follows a standard client-server architecture:
- A **React SPA frontend** communicates with the backend over a REST API and a WebSocket connection for chat.
- An **Express backend** exposes REST endpoints for auth, listings, tutoring, chat history, and admin functions, and handles Socket.io connections for real-time messaging.
- A **PostgreSQL database** (via Prisma) stores all persistent data, with a `universities` table and `university_id` scoping applied across relevant tables to keep each university's data logically separated.
- **Cloudinary** handles image uploads for listings.

*(Detailed database schema and API module breakdown are available in the accompanying `plan.md`.)*

---

## 9. Team Roles & Responsibilities

| Member | Primary Responsibility |
|---|---|
| Saleamlak Setie | Real-time chat module end-to-end, tutoring/bookings API (Full-stack) |
| Rufta Gaiem | Listings UI, search/filter UI, seller dashboard (Frontend) |
| Tesfaye Tilahun | Auth, user profiles, admin/moderation module (Backend) |
| Robin Mulugeta | Listings, search/filter module (Backend) |
| Yared Teweldebirhan | Auth flows, chat UI, profile pages, admin panel UI (Frontend) |

*(Roles are collaborative rather than strictly siloed — every member is expected to contribute to both frontend and backend work over the course of the project.)*

---

## 10. Timeline

An 8-week timeline is proposed, covering scoping and design, core feature development module by module, and a final week for testing, deployment, and documentation.

*(Full week-by-week breakdown is available in the accompanying `plan.md`.)*

---

## 11. Expected Outcomes / Deliverables

- A fully functional, deployed web application
- A public GitHub repository with clear documentation and setup instructions
- A shared Postman collection for API testing
- Seed data demonstrating multi-university support
- A short demo video walking through core user flows
- A portfolio-ready project each team member can present individually, with clear ownership of specific modules

---

## 12. Conclusion

Campus Marketplace & Resource Hub addresses a genuine, recurring problem in student life while giving all 5 team members meaningful full-stack experience: real-time systems, secure authentication, scoped multi-tenant data design, third-party integrations, and a deployable production-style application. Its scope is deliberately staged — a focused MVP first, with a clear and credible path to additional features — making it both achievable within the project timeline and strong as a long-term portfolio piece.
