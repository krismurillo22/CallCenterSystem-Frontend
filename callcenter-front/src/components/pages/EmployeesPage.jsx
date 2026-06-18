import React from "react";
import EmployeeGrid from "../employees/EmployeeGrid";

export default function EmployeesPage({
  employees,
  calls,
  onToggleAvailability,
  onToggleActive,
  onAdd,
  onEdit,
}) {
  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      <EmployeeGrid
        employees={employees}
        calls={calls}
        onToggleAvailability={onToggleAvailability}
        onToggleActive={onToggleActive}
        onAdd={onAdd}
        onEdit={onEdit}
      />
    </div>
  );
}