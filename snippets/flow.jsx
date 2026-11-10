// FireWeave diagram components. Stateless and string-props only, so Mintlify renders them on the server.
// Colours, radius and dark mode come from brand.css (.fw-* classes), which mirrors design-system-next tokens.

export const Flow = ({ kicker, title, children }) => (
  <div className="fw-flow not-prose" role="group" aria-label={title}>
    {kicker ? <span className="fw-flow-kicker">{kicker}</span> : null}
    {title ? <p className="fw-flow-title">{title}</p> : null}
    {children}
  </div>
);

export const FlowRow = ({ children }) => <div className="fw-flow-row">{children}</div>;

export const FlowStart = ({ label }) => <span className="fw-flow-item fw-start">{label || "START"}</span>;

export const FlowEnd = ({ label }) => <span className="fw-flow-item fw-end">{label || "END"}</span>;

export const FlowStep = ({ title, sub, kind }) => (
  <div className={"fw-flow-item fw-step" + (kind ? " fw-step-" + kind : "")}>
    <span className="fw-step-title">{title}</span>
    {sub ? <span className="fw-step-sub">{sub}</span> : null}
  </div>
);

export const FlowDecision = ({ label }) => (
  <div className="fw-flow-item fw-decision"><span>{label}</span></div>
);

export const FlowTurn = () => <span className="fw-turn" aria-hidden="true">↵</span>;

export const Ramp = ({ title, children }) => (
  <div className="fw-ramp not-prose" role="group" aria-label={title || "Rollout stages"}>
    {title ? <p className="fw-flow-title">{title}</p> : null}
    {children}
  </div>
);

export const RampStage = ({ label, percent, note }) => (
  <div className="fw-rung">
    <span className="fw-rung-label">{label}</span>
    <span className="fw-bar"><i className={"fw-w-" + percent}></i></span>
    <span className="fw-rung-note">{percent}% · {note}</span>
  </div>
);

export const StateRail = ({ title, children }) => (
  <div className="fw-states not-prose" role="group" aria-label={title || "Rollout states"}>
    {title ? <p className="fw-flow-title">{title}</p> : null}
    <div className="fw-states-row">{children}</div>
  </div>
);

export const State = ({ kind, children }) => (
  <span className={"fw-state" + (kind ? " fw-state-" + kind : "")}>{children}</span>
);

export const StateSep = ({ label }) => <span className="fw-state-sep">{label || "→"}</span>;
