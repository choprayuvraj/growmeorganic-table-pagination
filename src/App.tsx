import { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PiCaretDown } from "react-icons/pi";
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';
import axios from 'axios';
import { Button } from "primereact/button";

function App() {
  // Required States
  const [data, setData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [params, setParams] = useState({
    first: 0,
    rows: 12,
    page: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState<number>(0);
  const overlayRef: any = useRef(null);

  const baseURL = "https://api.artic.edu/api/v1";

  // useEffect will execute during initial page load or when params change
  useEffect(() => {
    // IIFE to fetch data from API
    (async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${baseURL}/artworks?page=${params.page}`);
        const fetchedData = response.data.data;
        setTotalRecords(response.data.pagination.total);
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
    })();
  }, [params]);

  // when page changes or pagination changes, value page changes
  const onPageChange = (e: any) => {
    setParams({
      first: e.first,
      rows: e.rows,
      page: e.page + 1,
    });
  };

  // handleSubmit function for selecting no. of multiple rows at once
  const handleSubmit = async (numRows: number) => {
    const noOfPages = Math.ceil(numRows / params.rows);
    const selectedRows: any[] = [];
    const fetchedPromises = [];

    // stores the promises to fetch pages data in array
    for (let i = params.page; i < params.page + noOfPages; i++) {
        fetchedPromises.push(axios.get(`${baseURL}/artworks?page=${i}`));
    }

    try {
        // resolving promises
        const responses = await Promise.all(fetchedPromises);
        // loop over responses and stores data in selectedRows array
        for (const response of responses) {
            const fetchedData = response.data.data;
            const remainingRows = numRows - selectedRows.length;

            if (remainingRows > 0) {
                selectedRows.push(...fetchedData.slice(0, remainingRows));
            } else {
                break;
            }
        }

        setSelectedRows(prev => [...prev, ...selectedRows]);
    } 
    catch (error) {
        console.error("Error fetching data: ", error);
    }

    overlayRef.current.hide();
  }

  return (
    <>
      <DataTable
        value={data}
        lazy
        paginator
        first={params.first}
        rows={params.rows}
        totalRecords={totalRecords}
        onPage={onPageChange}
        loading={isLoading}
        selectionMode="checkbox"
        selection={selectedRows}
        onSelectionChange={e => setSelectedRows(e.value)}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        <Column
          header={<PiCaretDown
            size={24}
            color='black'
            onClick={e => overlayRef.current.toggle(e)} />}
        />
        <Column field="title" header="Title"></Column>
        <Column field="place_of_origin" header="Place Of Origin"></Column>
        <Column field="artist_display" header="Artist Display"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Date Start"></Column>
        <Column field="date_end" header="Date End"></Column>
      </DataTable>

      <OverlayPanel ref={overlayRef}>
        <InputText
          value={String(inputValue)}
          onChange={e => setInputValue(Number(e.target.value))}
          keyfilter="int"
          placeholder="Search rows..."
        />
        <Button
          label="Submit"
          severity="secondary"
          outlined
          onClick={() => handleSubmit(inputValue)} />
      </OverlayPanel>
    </>
  );
}

export default App;
