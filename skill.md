# PRISM OpenClaw Agent Skill

## Overview
PRISM is an OpenClaw-powered AI ecosystem discovery and recommendation agent. It specializes in finding the best AI models, research papers, and implementation repositories for edge computing and mobile devices.

## Pipeline Steps
1. **parse_input**: Extracts task, device constraints, and performance requirements from natural language.
2. **retrieve_candidates**: Initial multi-source retrieval (HuggingFace, GitHub, ArXiv).
3. **expand_search_context** [Agentic]: Analyzes initial results to find high-value technical keywords and performs a recursive second-pass retrieval.
4. **score_candidates**: Evaluates candidates against constraints using a multi-dimensional scoring engine.
5. **analyze_trends**: Determines if a project is rising or declining based on community activity.
6. **check_compatibility**: Validates if the model/code can actually run on the target hardware.
7. **build_report**: Generates a structured recommendation report.

## Autonomous Capabilities
- **Keyword Extraction**: Automatically identifies related technical terms (e.g., "quantized", "ONNX", "Edge TPU") from initial findings.
- **Recursive Retrieval**: Proactively explores the search space beyond the user's initial query.

## Integration
Powered by **OpenClaw Orchestration**.
