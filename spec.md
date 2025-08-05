# Product Specification: Virtual Green Fleet (VGF) Orchestrator

**Version:** 1.0  
**Status:** Proposal  
**Author:** Product Management  
**Date:** August 5, 2025

## 1. Executive Summary

The rapid electrification of commercial vehicle fleets presents a dual-sided challenge for the energy sector. For utilities, it introduces an unprecedented, concentrated, and unpredictable load that threatens to destabilize local grids and require billions in unplanned capital upgrades. For fleet operators, the high upfront cost of EVs and charging infrastructure, coupled with volatile energy prices, creates significant financial risk.

The **Virtual Green Fleet (VGF) Orchestrator** is a standalone, enterprise-grade software platform that transforms this dual-sided challenge into a shared opportunity. By intelligently managing the charging and discharging of electric vehicle fleets, the VGF Orchestrator aggregates them into a dispatchable Virtual Power Plant (VPP).

This platform enables utilities to leverage EV fleets as a grid-stabilizing asset while providing fleet operators with a new revenue stream that dramatically lowers the total cost of ownership (TCO) of their electric fleet, accelerating adoption and creating a symbiotic relationship between transportation and energy infrastructure.

## 2. Target Market & Value Proposition

### 2.1. Primary Customer: Electric Utilities
*(Regulated IOUs, Municipal Utilities, and Electric Cooperatives)*

**Problem:** Unmanaged fleet electrification leads to grid congestion, voltage violations, and necessitates costly, time-consuming infrastructure upgrades. Utilities lack the tools to control this new load class and integrate it into their grid operations.

**Value Proposition:**
- **Capital Deferral:** Avoid or postpone multi-million dollar substation and feeder upgrades by using VGFs to manage load at the grid edge.
- **Grid Resilience:** Gain a dispatchable resource for peak load shaving, frequency regulation, and voltage support, reducing reliance on fossil-fuel peaker plants.
- **New Revenue & Cost Savings:** Reduce energy procurement costs by optimizing charging and generate new revenue by bidding the aggregated VGF capacity into wholesale energy markets (ISO/RTO).
- **Enhanced C&I Customer Relations:** Become an indispensable energy partner to high-value commercial and industrial customers, helping them achieve their ESG and electrification goals.

### 2.2. Secondary Beneficiary & Channel Partner: Commercial Fleet Operators
*(Logistics, Public Transit, School Districts, Municipal Services, Last-Mile Delivery)*

**Problem:** High TCO of electric fleets, including vehicle purchase, charging infrastructure, and demand charges from utilities. Operational risk of vehicles not being sufficiently charged for their daily routes.

**Value Proposition:**
- **New Revenue Stream:** Generate significant income by providing valuable grid services during vehicle idle times.
- **Reduced Operational Costs:** Minimize electricity costs through intelligent load shifting to off-peak hours and by avoiding punitive utility demand charges.
- **Accelerated ROI:** Dramatically shorten the payback period for EV investments, de-risking the transition to an electric fleet.
- **Operational Assurance:** Guarantee that all vehicles meet their required state-of-charge for their next scheduled routes, managed automatically by the platform.

## 3. System Architecture & Core Modules

The VGF Orchestrator is a cloud-native SaaS platform built on a modular, API-first architecture.

### Module 1: Fleet & Asset Integration Gateway
**Purpose:** The secure entry point for all external fleet and asset data.

**Key Features:**
- Standardized API connectors for major EV telematics providers (e.g., Geotab, Samsara, Verizon Connect).
- OCPP (Open Charge Point Protocol) compliance for integration with a wide range of commercial charging hardware.
- A secure web portal for fleet managers to enroll vehicles, define operational groups, and set non-negotiable constraints (e.g., "Bus fleet must be 100% charged by 6 AM").

### Module 2: Synthetic Telematics & Planning Engine
**Purpose:** An AI-powered simulation tool to model and forecast the impact and value of VGFs.

**Key Features:**
- Generates high-fidelity, synthetic operational data for various fleet archetypes (delivery vans, school buses, etc.).
- **For Utilities:** Runs grid impact studies to identify necessary upgrades or non-wires alternatives before a charging depot is even built.
- **For Fleet Operators:** Creates a data-driven financial pro-forma, projecting potential V2G revenue and cost savings to build a compelling business case.

### Module 3: V2G Orchestration & Dispatch Core
**Purpose:** The AI-driven brain of the platform that performs real-time optimization and dispatch.

**Key Features:**
- **Co-optimization Algorithm:** Continuously solves for the lowest charging cost for the fleet while maximizing grid service value for the utility, all while respecting 100% of defined operational constraints.
- **Predictive Control:** Ingests real-time grid data, market prices, and weather forecasts to anticipate grid needs and proactively manage fleet charging/discharging schedules.
- **Device-Level Control:** Capable of sending secure, direct control signals (start charge, stop charge, set discharge rate) to individual chargers or vehicles.

### Module 4: Market Integration & Financial Settlement Engine
**Purpose:** Manages the economic transactions and performance reporting.

**Key Features:**
- API integration with ISO/RTO platforms (e.g., CAISO, PJM, ERCOT) for market participation and bidding.
- Automated calculation of payments and credits based on precise, metered data for services rendered.
- Auditable, transparent dashboards for both utility and fleet managers detailing financial performance, energy dispatched, and carbon emissions avoided.

## 4. Technical & Integration Requirements

As a standalone product, the VGF Orchestrator requires secure, reliable integration with the following systems:

### Utility Systems:
- **Required:** Advanced Distribution Management System (ADMS) or SCADA for real-time grid topology and operational constraints.
- **Required:** Meter Data Management System (MDMS) for access to revenue-grade meter data for settlement.
- **Optional:** Distributed Energy Resource Management System (DERMS) for coordinated dispatch with other grid assets.

### Fleet Operator Systems:
- **Required:** Fleet Management/Telematics Platform API for vehicle SoC, location, and operational status.
- **Required:** OCPP-compliant EVSE (charging station) Management System.

### External Systems:
- **Required:** Wholesale Energy Market Platforms (ISO/RTO) for price signals and bidding.
- **Required:** Weather forecasting service APIs for load and generation prediction.

## 5. Key Performance Indicators (KPIs) for Success

The value of the VGF Orchestrator will be measured by:

### For Utilities:
- $ in deferred capital expenditure.
- MW of peak load reduction achieved.
- $ of revenue generated from wholesale market participation.
- # of C&I fleets enrolled in the program.

### For Fleet Operators:
- $ of monthly revenue generated and/or costs saved.
- % reduction in fleet TCO.
- 100% success rate in meeting vehicle state-of-charge requirements.