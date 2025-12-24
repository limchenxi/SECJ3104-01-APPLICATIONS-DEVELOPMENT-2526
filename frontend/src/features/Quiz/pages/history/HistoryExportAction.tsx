import React, { useState } from "react";
import { IconButton, Menu, MenuItem, ListItemText } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
// import checkIcon from "@mui/icons-material/Check";
// import CloseIcon from "@mui/icons-material/Close"; // Or any icon for "No Answer"

interface HistoryExportActionProps {
    historyItem: any;
    onExport: (showAnswers: boolean) => void;
}

export const HistoryExportAction: React.FC<HistoryExportActionProps> = ({
    historyItem,
    onExport,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        // If it's a flashcard, maybe just export directly? 
        // But for consistency and since the user specifically asked for "topic quiz", 
        // we'll show the menu for quizzes.
        // Let's just show menu for everything for now, or check type.
        if (historyItem.contentType === 'flashcard') {
            // For flashcards, answer/no-answer distinction might not apply or be different.
            // If we want to skip menu for flashcards:
            onExport(true);
            return;
        }
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleExportOption = (showAnswers: boolean) => {
        onExport(showAnswers);
        handleClose();
    };

    return (
        <>
            <IconButton size="small" onClick={handleClick} title="Muat Turun PDF">
                <DownloadIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}
            >
                <MenuItem onClick={() => handleExportOption(true)}>
                    <ListItemText>PDF (Dengan Jawapan)</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleExportOption(false)}>
                    <ListItemText>PDF (Tanpa Jawapan)</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};
