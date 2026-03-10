import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InboxIcon from "@mui/icons-material/InboxOutlined";
import { motion } from "framer-motion";

export type Transaction = {
  id: number;
  amount: number;
  category?: string;
  source?: string;
  date: string;
  description?: string;
};

type Props = {
  data: Transaction[];
  type: "income" | "expense";
  onEdit: (item: Transaction) => void;
  onDelete: (id: number) => void;
};

const TransactionTable = ({ data, type, onEdit, onDelete }: Props) => {
  const label = type === "income" ? "Source" : "Category";

  return (
    <Card>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem" }}>
                Date
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem" }}>
                Amount
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem" }}>
                {label}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem" }}>
                Description
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 6, border: "none" }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                        color: "text.secondary",
                      }}
                    >
                      <InboxIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                      <Typography variant="body2">No transactions yet</Typography>
                      <Typography variant="caption">
                        Add your first {type === "income" ? "income" : "expense"} using the form above
                      </Typography>
                    </Box>
                  </motion.div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((t) => (
                <TableRow key={t.id} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                  <TableCell>{t.date}</TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: type === "income" ? "success.main" : "error.main",
                    }}
                  >
                    {type === "income" ? "+" : "−"}₹{Number(t.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>{t.category || t.source || "—"}</TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>{t.description || "—"}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => onEdit(t)} aria-label="Edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(t.id)}
                      aria-label="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default TransactionTable;
