"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye, FilePen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import {
  DataTableBase,
  DataTableColumnHeader,
  DataTableFacetedFilter,
} from "~/app/_components/data-table";

import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Link } from "~/app/_components/ui/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/app/_components/ui/tooltip";
import { type PageWithAll } from "~/lib/models/Pages";
import { api } from "~/trpc/react";
import { withSessionProvider } from "~/utils/withSessionProvider";
import { Checkbox } from "~/app/_components/ui/checkbox";
import type { PageStatus, User } from "@prisma/client";
import { PageStatusBadge } from "./display";

interface PagesDataTableProps {
  data: PageWithAll[];
  children?: React.ReactNode;
}

const columns: ColumnDef<PageWithAll>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorFn: (row) => row.title,
    header: "Titre",
    cell: (data) => {
      return (
        <div className="text-xs capitalize">{data.getValue() as string}</div>
      );
    },
  },
  {
    accessorFn: (row) => row.path,
    header: "Chemin",
    cell: (data) => {
      return (
        <div className="text-xs capitalize">{data.getValue() as string}</div>
      );
    },
  },
  {
    accessorFn: (originalRow) => {
      return originalRow.CreatedBy;
    },
    id: "Crée par",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Crée par" />;
    },
    cell: (info) => {
      const user = info.getValue() as User | null;
      return <div className="text-xs">{user?.name ?? "Inconnu"}</div>;
    },
    enableSorting: false,
  },
  {
    accessorFn: (originalRow) => {
      return originalRow.status;
    },
    header: "Statut",
    id: "Statut",
    cell: (info) => {
      const status = info.getValue() as PageStatus;
      return <PageStatusBadge status={status} />;
    },
    filterFn: (row, id, value: string[]) => {
      const status: PageStatus = row.getValue(id);
      return value.includes(status.toString());
    },
  },

  {
    accessorFn: (originalRow) => {
      return originalRow.Revisions.length;
    },
    id: "Révisions",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Révisions" />;
    },
    cell: (info) => {
      const nb = info.getValue() as number;
      return <div className="text-xs">{nb}</div>;
    },
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const PagesDataTableCell = () => {
        const router = useRouter();
        const page = row.original;

        const deletePage = api.page.delete.useMutation({
          onSuccess: () => {
            router.refresh();
            toast.success("Page supprimée");
          },
          onError: () => {
            toast.error("Une erreur est survenue");
          },
        });

        async function handleDelete() {
          try {
            await deletePage.mutateAsync({ id: page.id });
          } catch (error) {
            console.error("Delete user error:", error);
            toast.error(
              error instanceof Error
                ? error.message
                : "Une erreur est survenue",
            );
          }
        }

        return (
          <section className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={page.path}
                  variant={"icon"}
                  size={"icon"}
                  target="_blank"
                  className="text-primary p-0"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Modifier</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/admin/pages/${page.id}`}
                  variant={"icon"}
                  size={"icon"}
                  className="text-primary p-0"
                >
                  <FilePen className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Modifier</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="icon"
                  size={"icon"}
                  className="text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-destructive text-primary-foreground border-none">
                Supprimer
              </TooltipContent>
            </Tooltip>
          </section>
        );
      };

      return <PagesDataTableCell />;
    },
  },
];

const DataTablePagesOne: React.FC<PagesDataTableProps> = ({
  data,
  children,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    getRowId: (row) => row.id,
  });

  /* const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => {
    return row.original.id;
  });
 */

  const status: { label: string; value: string }[] = [];

  data.forEach((page) => {
    if (!status.find((role) => role.value === page.status)) {
      status.push({
        label: page.status,
        value: page.status,
      });
    }
  });

  return (
    <DataTableBase table={table} columns={columns} selection>
      {children}
      <Input
        placeholder="Chercher une page..."
        value={(table.getColumn("Titre")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("Titre")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
      {table.getColumn("Statut") && (
        <DataTableFacetedFilter
          column={table.getColumn("Statut")}
          title="Statut"
          options={status}
        />
      )}
    </DataTableBase>
  );
};

export const DataTablePages = withSessionProvider(DataTablePagesOne);
