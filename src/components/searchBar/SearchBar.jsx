import React, { useEffect, useState } from "react";
import { Flex, Input, Select, Button, Box } from "@chakra-ui/react";
import eventApi from "../../Api/event";

const initSearchValues = {
  title: "",
  province: "",
  locality: "",
  dateMonth: "",
};

const SearchBar = ({ searchEvents, cancelSearch }) => {
  const [provinces, setProvinces] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchValues, setSearchValues] = useState(initSearchValues);

  useEffect(() => {
    const getProvinces = async () => {
      try {
        const { data } = await eventApi.getProvinces();
        setProvinces(data.provinces);
      } catch (error) {
        console.log(error);
      }
    };
    getProvinces();
  }, []);

  useEffect(() => {
    const getLocalities = async () => {
      if (!searchValues.province) return;
      const { data } = await eventApi.getLocalitiesByProvince(
        searchValues.province
      );
      setLocalities(data.localities);
    };
    getLocalities();
  }, [searchValues.province]);

  const handleSearchValues = (event) => {
    const { name, value } = event.target;
    setSearchValues({
      ...searchValues,
      [name]: value,
    });
  };

  const handleSearch = () => {
    setIsSearching(true);
    searchEvents(searchValues);
  };

  return (
    <Box
      bg="#fff"
      border="2px solid purple"
      mt="1rem"
      justifyContent="center"
      aling="center"
      p={4}
      borderRadius={8}
    >
      <Flex style={{ justifyContent: "space-between" }} gap="1">
        <Input
          placeholder="Titulo"
          maxWidth="20%"
          name="title"
          onChange={handleSearchValues}
          value={searchValues.title}
        />
        <Select
          name="province"
          placeholder="Seleccione una provincia"
          onChange={handleSearchValues}
          maxWidth="20%"
          value={searchValues.province}
        >
          {provinces.map((province, index) => (
            <option key={index} value={province}>
              {province}
            </option>
          ))}
        </Select>
        <Select
          placeholder="Seleccione una localidad"
          maxWidth="20%"
          disabled={!searchValues.province || !localities.length}
          name="locality"
          onChange={handleSearchValues}
          value={searchValues.locality}
        >
          {localities.map((locality) => (
            <option key={locality} value={locality}>
              {locality}
            </option>
          ))}
        </Select>
        <Select
          placeholder="Mes"
          maxWidth="20%"
          name="dateMonth"
          onChange={handleSearchValues}
          value={searchValues.dateMonth}
        >
          <option value="1">Enero</option>
          <option value="2">Febrero</option>
          <option value="3">Marzo</option>
          <option value="4">Abril</option>
          <option value="5">Mayo</option>
          <option value="6">Junio</option>
          <option value="7">Julio</option>
          <option value="8">Agosto</option>
          <option value="9">Septiembre</option>
          <option value="10">Octubre</option>
          <option value="11">Noviembre</option>
          <option value="12">Diciembre</option>
        </Select>

        {isSearching ? (
          <Button
            style={{ maxWidth: "20%" }}
            onClick={() => {
              setIsSearching(false);
              setSearchValues(initSearchValues);
              cancelSearch();
            }}
            borderRadius="5px"
            colorScheme="red"
            fontFamily="secondary"
            fontWeight="normal"
          >
            Limpiar
          </Button>
        ) : (
          <Button
            style={{ maxWidth: "20%" }}
            onClick={handleSearch}
            bg="primary"
            borderRadius="5px"
            color="#fff"
            _hover={{ bg: "buttonHover" }}
            _active={{ bg: "buttonHover" }}
            fontFamily="secondary"
            fontWeight="normal"
          >
            Buscar
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default SearchBar;
