"""
Builds the complaint-intake LangGraph:

            START
              |
          route_intake
          /          \\
   [extract]        [correct]
       |                |
  assess_risk          END
       |
      END

- A brand new session (no extracted_data yet) always goes through
  extract -> risk_assessment.
- A follow-up correction message on an existing session skips straight
  to correct and does NOT re-run risk assessment (matches the demo,
  where correcting the batch number doesn't reset severity/priority).
"""
from langgraph.graph import StateGraph, START, END

from app.agents.state import ComplaintAgentState
from app.agents.nodes import (
    route_intake,
    extract_node,
    correct_node,
    risk_assessment_node,
)


def build_complaint_graph():
    graph = StateGraph(ComplaintAgentState)

    graph.add_node("extract", extract_node)
    graph.add_node("correct", correct_node)
    graph.add_node("assess_risk", risk_assessment_node)

    graph.add_conditional_edges(
        START,
        route_intake,
        {"extract": "extract", "correct": "correct"},
    )
    graph.add_edge("extract", "assess_risk")
    graph.add_edge("assess_risk", END)
    graph.add_edge("correct", END)

    return graph.compile()


# Compiled once at import time and reused across requests.
complaint_graph = build_complaint_graph()
