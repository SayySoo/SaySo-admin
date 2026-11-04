
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Search,
  RefreshCw,
  UserRoundPlus,
} from "lucide-react";

import {
  getAllComplaintsApi,
  getStaffApi,
  getCategoriesApi,
  assignComplaintApi,
  updateComplaintApi,
  deleteComplaintApi,
  
} from "@/lib/api-client";

import { useAuth } from "@/context/authContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Separator } from "@/components/ui/separator";
import { UpdateComplaintPayload } from "@/types/complaints/type";
import { toast } from "sonner";

// --------------------------------------------------
// Types
// --------------------------------------------------

type Complaint = {
  id: number;
  title: string;
  description?: string;
  location?: string;
  building?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  status: string;

  student?: {
    name?: string;
    email?: string;
  };

  category?: {
    id?: number;
    name?: string;
    slug?: string;
  };

  assignedStaff?: {
    name?: string;
    email?: string;
  };

  createdAt?: string;
};

type Staff = {
  id: number;
  name: string;
  email: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function getStatusLabel(status: string) {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    case "rejected":
      return "Rejected";
    default:
      return status.replaceAll("_", " ");
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    in_progress:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    resolved:
      "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400",
    rejected:
      "border-destructive/30 bg-destructive/10 text-destructive",
  };

  return (
    <Badge
      variant="outline"
      className={styles[status] ?? "text-muted-foreground"}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}

function formatDate(date?: string) {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SortableHeader({
  column,
  children,
}: {
  column: any;
  children: React.ReactNode;
}) {
  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 font-medium"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {children}

      {sorted === "asc" ? (
        <ArrowUp className="ml-2 size-4" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-2 size-4" />
      ) : (
        <ArrowUpDown className="ml-2 size-4" />
      )}
    </Button>
  );
}

// --------------------------------------------------
// Page
// --------------------------------------------------

export default function ComplaintsPage() {
  const { user } = useAuth();

  // Data
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Loading
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filters and sorting
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Dialog states
  const [assignComplaint, setAssignComplaint] =
    useState<Complaint | null>(null);

  const [viewComplaint, setViewComplaint] =
    useState<Complaint | null>(null);

  const [editComplaint, setEditComplaint] =
    useState<Complaint | null>(null);

  const [deleteComplaint, setDeleteComplaint] =
    useState<Complaint | null>(null);

  // Assignment
  const [selectedStaffEmail, setSelectedStaffEmail] = useState("");

  // Update form
  const [form, setForm] = useState<UpdateComplaintPayload>({
    title: "",
    description: "",
    location: "",
    building: "",
    priority: "medium",
    categorySlug: "",
  });

  const [formError, setFormError] = useState("");

  // Typed form updater
  const updateForm = <K extends keyof UpdateComplaintPayload>(
    key: K,
    value: UpdateComplaintPayload[K]
  ) => {
    setForm((current: UpdateComplaintPayload) => ({
      ...current,
      [key]: value,
    }));
  };

  // --------------------------------------------------
  // Fetch data
  // --------------------------------------------------

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [complaintsRes, staffRes, categoriesRes] =
        await Promise.all([
          getAllComplaintsApi("?limit=50"),
          getStaffApi(),
          getCategoriesApi(),
        ]);

      const complaintsData = Array.isArray(complaintsRes)
        ? complaintsRes
        : complaintsRes?.data?.data ??
          complaintsRes?.data ??
          [];

      const staffData = Array.isArray(staffRes)
        ? staffRes
        : staffRes?.data?.data ??
          staffRes?.data ??
          [];

      const categoriesData = Array.isArray(categoriesRes)
        ? categoriesRes
        : categoriesRes?.data?.data ??
          categoriesRes?.data ??
          [];

      setComplaints(complaintsData);
      setStaff(staffData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --------------------------------------------------
  // Filtering
  // --------------------------------------------------

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        complaint.title?.toLowerCase().includes(query) ||
        complaint.student?.name?.toLowerCase().includes(query) ||
        complaint.student?.email?.toLowerCase().includes(query) ||
        complaint.category?.name?.toLowerCase().includes(query) ||
        String(complaint.id).includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        complaint.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, search, statusFilter]);

  // --------------------------------------------------
  // Assign staff
  // --------------------------------------------------

  const handleAssign = async () => {
    if (!assignComplaint || !selectedStaffEmail) return;

    if (!user?.email) {
      console.error("Admin email is not available.");
      return;
    }

    try {
      setAssigning(true);

      await assignComplaintApi(
        assignComplaint.id,
        selectedStaffEmail,
        user.email
      );

      setAssignComplaint(null);
      setSelectedStaffEmail("");

      await fetchData(true);
    } catch (error) {
      console.error("Failed to assign complaint:", error);
    } finally {
      setAssigning(false);
    }
  };

  // --------------------------------------------------
  // Open update dialog
  // --------------------------------------------------

  const openUpdateDialog = (complaint: Complaint) => {
    const matchingCategory = categories.find(
      (category) =>
        category.id === complaint.category?.id ||
        category.slug === complaint.category?.slug ||
        category.name === complaint.category?.name
    );

    setForm({
      title: complaint.title ?? "",
      description: complaint.description ?? "",
      location: complaint.location ?? "",
      building: complaint.building ?? "",
      priority: complaint.priority ?? "medium",
      categorySlug:
        complaint.category?.slug ??
        matchingCategory?.slug ??
        "",
    });

    setFormError("");
    setEditComplaint(complaint);
  };

  // --------------------------------------------------
  // Update complaint
  // --------------------------------------------------

  const handleUpdate = async () => {
    if (!editComplaint) return;

    if (!form.categorySlug) {
      setFormError("Please select a complaint category.");
      return;
    }

    if (form.title.trim().length < 5) {
      setFormError("Title must contain at least 5 characters.");
      return;
    }

    if (form.description.trim().length < 10) {
      setFormError("Description must contain at least 10 characters.");
      return;
    }

    if (form.location.trim().length < 2) {
      setFormError("Please enter a valid location.");
      return;
    }

    if (form.building.trim().length < 2) {
      setFormError("Please enter a valid building.");
      return;
    }

    try {
      setUpdating(true);
      setFormError("");

      await updateComplaintApi(editComplaint.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        building: form.building.trim(),
        priority: form.priority,
        categorySlug: form.categorySlug,
      });
      toast.success("Successfully update complaint")
      setEditComplaint(null);
      await fetchData(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to update complaint !"
      );
      toast.error("Failed to update complint")
    } finally {
      setUpdating(false);
    }
  };

  // --------------------------------------------------
  // Delete complaint
  // --------------------------------------------------

  const handleDelete = async () => {
    if (!deleteComplaint) return;

    try {
      setDeleting(true);

      await deleteComplaintApi(deleteComplaint.id);

      setComplaints((current: Complaint[]) =>
        current.filter(
          (complaint) => complaint.id !== deleteComplaint.id
        )
      );

      setDeleteComplaint(null);
    } catch (error) {
      console.error("Failed to delete complaint:", error);
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------
  // Table columns
  // --------------------------------------------------

  const columns: ColumnDef<Complaint>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader column={column}>ID</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          #{row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <SortableHeader column={column}>Complaint</SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="max-w-[260px]">
          <p className="truncate font-medium">
            {row.original.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.location || "No location"}
          </p>
        </div>
      ),
    },
    {
      id: "student",
      accessorFn: (row) => row.student?.name ?? "",
      header: "Student",
      cell: ({ row }) => (
        <div className="min-w-[140px]">
          <p className="font-medium">
            {row.original.student?.name || "Unknown"}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.student?.email || "N/A"}
          </p>
        </div>
      ),
    },
    {
      id: "category",
      accessorFn: (row) => row.category?.name ?? "",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.category?.name || "Uncategorized"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} />
      ),
    },
    {
      id: "assignedStaff",
      accessorFn: (row) => row.assignedStaff?.name ?? "",
      header: "Assigned To",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.assignedStaff?.name || "Unassigned"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader column={column}>Created</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const complaint = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={`Actions for complaint ${complaint.id}`}
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Open actions</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setViewComplaint(complaint)}
                  className="gap-2"
                >
                  <Eye className="size-4 shrink-0" />
                  View complaint
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => openUpdateDialog(complaint)}
                  className="gap-2"
                >
                  <Pencil className="size-4 shrink-0" />
                  Update complaint
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setAssignComplaint(complaint);
                    setSelectedStaffEmail(
                      complaint.assignedStaff?.email || ""
                    );
                  }}
                  className="gap-2"
                >
                  <UserRoundPlus className="size-4 shrink-0" />
                  Assign staff
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setDeleteComplaint(complaint)}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4 shrink-0" />
                  Delete complaint
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // --------------------------------------------------
  // TanStack table
  // --------------------------------------------------

  const table = useReactTable({
    data: filteredComplaints,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="space-y-7">
      {/* Page heading */}

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Complaints
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage, review, update, and assign campus complaints.
        </p>
      </div>

      {/* Table */}

      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          {/* Toolbar */}

          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">All Complaints</h2>
              <p className="text-sm text-muted-foreground">
                {filteredComplaints.length} complaints found
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative w-full sm:w-[260px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value ?? "all");
                }}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchData(true)}
                disabled={refreshing}
                aria-label="Refresh complaints"
              >
                <RefreshCw
                  className={`size-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
          </div>

          {/* Data table */}

          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Loading complaints...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No complaints found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}

          <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {Math.max(table.getPageCount(), 1)}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="mr-1 size-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================== */}
      {/* VIEW COMPLAINT */}
      {/* ============================================== */}

      <Dialog
        open={!!viewComplaint}
        onOpenChange={(open) => {
          if (!open) setViewComplaint(null);
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Complaint details</DialogTitle>
            <DialogDescription>
              Review the complaint submitted by the student.
            </DialogDescription>
          </DialogHeader>

          {viewComplaint && (
            <div className="space-y-5">
              <div>
                <p className="text-xs text-muted-foreground">
                  Complaint #{viewComplaint.id}
                </p>

                <h3 className="mt-1 text-lg font-semibold">
                  {viewComplaint.title}
                </h3>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Student
                  </p>
                  <p className="text-sm font-medium">
                    {viewComplaint.student?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {viewComplaint.student?.email || "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Category
                  </p>
                  <p className="text-sm font-medium">
                    {viewComplaint.category?.name || "Uncategorized"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Status
                  </p>
                  <StatusBadge status={viewComplaint.status} />
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Priority
                  </p>
                  <p className="text-sm font-medium capitalize">
                    {viewComplaint.priority || "Not specified"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Location
                  </p>
                  <p className="text-sm font-medium">
                    {viewComplaint.location || "Not provided"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Building
                  </p>
                  <p className="text-sm font-medium">
                    {viewComplaint.building || "Not provided"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Assigned staff
                  </p>
                  <p className="text-sm font-medium">
                    {viewComplaint.assignedStaff?.name || "Unassigned"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Created
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(viewComplaint.createdAt)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Description</p>

                <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm leading-6 text-muted-foreground">
                  {viewComplaint.description ||
                    "No description provided."}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================== */}
      {/* UPDATE COMPLAINT */}
      {/* ============================================== */}

      <Dialog
        open={!!editComplaint}
        onOpenChange={(open) => {
          if (!open && !updating) {
            setEditComplaint(null);
            setFormError("");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Update complaint</DialogTitle>
            <DialogDescription>
              Edit the complaint information submitted by the student.
            </DialogDescription>
          </DialogHeader>

          {editComplaint && (
            <div className="space-y-4">
              {/* Title */}

              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>

                <Input
                  value={form.title}
                  onChange={(event) =>
                    updateForm("title", event.target.value)
                  }
                  placeholder="Complaint title"
                />
              </div>

              {/* Description */}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  rows={4}
                  placeholder="Describe the complaint..."
                  className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* Location and building */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Location
                  </label>

                  <Input
                    value={form.location}
                    onChange={(event) =>
                      updateForm("location", event.target.value)
                    }
                    placeholder="Room / Lab"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Building
                  </label>

                  <Input
                    value={form.building}
                    onChange={(event) =>
                      updateForm("building", event.target.value)
                    }
                    placeholder="Building name"
                  />
                </div>
              </div>

              {/* Priority and category */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Priority
                  </label>

                  <Select
                    value={form.priority}
                    onValueChange={(value) => {
                      if (value !== null) {
                        updateForm(
                          "priority",
                          value as UpdateComplaintPayload["priority"]
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Category
                  </label>

                  <Select
                    value={form.categorySlug}
                    onValueChange={(value) => {
                      if (value !== null) {
                        updateForm("categorySlug", value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>

                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.slug}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Validation error */}

              {formError && (
                <p className="text-sm text-destructive">
                  {formError}
                </p>
              )}

              {/* Actions */}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditComplaint(null)}
                  disabled={updating}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleUpdate}
                  disabled={updating}
                >
                  {updating && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}

                  Save changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================== */}
      {/* ASSIGN STAFF */}
      {/* ============================================== */}

      <Dialog
        open={!!assignComplaint}
        onOpenChange={(open) => {
          if (!open && !assigning) {
            setAssignComplaint(null);
            setSelectedStaffEmail("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign complaint</DialogTitle>

            <DialogDescription>
              Select a staff member to handle this complaint.

              {assignComplaint && (
                <span className="mt-2 block font-medium text-foreground">
                  #{assignComplaint.id} · {assignComplaint.title}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-sm font-medium">
              Select staff member
            </label>

            <Select
              value={selectedStaffEmail}
              onValueChange={(value) => {
                setSelectedStaffEmail(value ?? "");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose staff member" />
              </SelectTrigger>

              <SelectContent>
                {staff.length > 0 ? (
                  staff.map((member) => (
                    <SelectItem
                      key={member.id}
                      value={member.email}
                    >
                      {member.name} ({member.email})
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                    No staff members available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignComplaint(null);
                setSelectedStaffEmail("");
              }}
              disabled={assigning}
            >
              Cancel
            </Button>

            <Button
              onClick={handleAssign}
              disabled={!selectedStaffEmail || assigning}
            >
              {assigning && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Assign complaint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================== */}
      {/* DELETE COMPLAINT */}
      {/* ============================================== */}

      <AlertDialog
        open={!!deleteComplaint}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteComplaint(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this complaint?
            </AlertDialogTitle>

            <AlertDialogDescription>
              {deleteComplaint && (
                <>
                  You are about to permanently delete complaint #
                  {deleteComplaint.id},{" "}
                  "{deleteComplaint.title}". This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}

              Delete complaint
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
